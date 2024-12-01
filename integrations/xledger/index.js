import axios from 'axios';
import * as dates from '../../core/dates.js';
import { XLEDGER_CONFIG_FILE } from './constants.js';
import { setupFilesInHomeAndPromptForInfo } from './configuration.js';

function gql(literals, ...values) {
  let str = '';
  literals.forEach((literal, i) => {
    str += literal + (values[i] || '');
  });
  return str;
}

/**
 * @typedef {Object} XLedgerNode
 * @property {string} workingHours - Working hours as decimal in a string
 */

/**
 * @typedef {Object} XLedgerEdge
 * @property {string} cursor - Timesheets DbId
 * @property {XLedgerNode} node
 */

const getTimeEntriesGql = gql`
  query GetTimeEntries($first: Int, $from: String, $employeeId: Int, $cursor: Int64String) {
    timesheets(
      first: $first
      filter: { employeeDbId: $employeeId, assignmentDate_gte: $from, dbId_gt: $cursor }
    ) {
      edges {
        node {
          workingHours
        }
        cursor
      }
    }
  }
`;

/**
 * @param {object} headers - headers to send to harvest
 * @param {number} employeeId - headers to send to harvest
 * @param {string} from - headers to send to harvest
 * @returns {AsyncGenerator<XLedgerEdge, void, *>}
 */
export async function* timeEdgeGenerator(headers, employeeId, from) {
  const variables = {
    first: 10_000,
    employeeId,
    from,
    cursor: 0,
  };

  async function post() {
    let result;
    let data;
    try {
      result = await axios.post(
        'https://www.xledger.net/graphql',
        { query: getTimeEntriesGql, variables },
        { headers }
      );
      data = result.data;

      if (data.errors) {
        throw new Error(result.errors);
      }
    } catch (error) {
      console.log(`\x1b[31mAn error occured when attempting to get data from XLedger\x1b[0m`);
      console.log('Response from XLedger:', data?.errors);
      console.log(`Are the values in \x1b[33m${XLEDGER_CONFIG_FILE}\x1b[0m correct?`);
      console.error('Error:', error);
      process.exit(1);
    }

    return data.data.timesheets.edges;
  }

  let nodes = await post();
  do
    for (let node of nodes) {
      variables.cursor = node.cursor;
      yield node;
    }
  while (nodes?.length && (nodes = await post()));
}

/**
 * @param {Date} from
 * @param {Date} to
 */
export async function getWorkHours(from) {
  const config = await setupFilesInHomeAndPromptForInfo();
  const headers = {
    Authorization: `token ${config.apiKey}`,
    'Content-Type': 'application/json',
  };
  const fromString = dates.dateToISODateWithoutOffset(from);

  const pattern = /^\d+\.\d+$/;

  let hours = 0;
  for await (let { node } of timeEdgeGenerator(headers, config.employeeId, fromString)) {
    if (!pattern.test(node.workingHours)) {
      console.error(`Invalid working hours string: ${node.workingHours}`);
      process.exit(1);
    }

    hours += Number(node.workingHours);
  }
  return hours;
}

/**
 * @param {{to: Date, from: Date , balance: number}} obj
 * */
export async function afterRun({ balance }) {
  console.log('Flex balance:', balance);
}
