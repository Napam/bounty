import * as dates from '../../core/dates.js';
import { setupFilesInHomeAndPromptForInfo } from './configuration.js';
import { HARVEST_CONFIG_FILE } from './constants.js';
import axios from 'axios';
import { getConfig as getCoreConfig, validateAndProcessBountyConfig } from '../../cli/configuration.js';

/**
 * @typedef {import('./configuration.js').HarvestEntryFilter} HarvestEntryFilter
 */

/**
 * @typedef {Object} HarvestTimeEntry
 * @property {number} hours - The number of hours worked.
 * @property {string} created_at - The date and time the time entry was created in ISO 8601 format.
 * @property {string} updated_at - The date and time the time entry was last updated in ISO 8601 format.
 * @property {Object} client - The client associated with the time entry.
 * @property {number} client.id - The ID of the client.
 * @property {string} client.name - The name of the client.
 * @property {string} client.currency - The currency used by the client.
 * @property {Object} project - The project associated with the time entry.
 * @property {number} project.id - The ID of the project.
 * @property {string} project.name - The name of the project.
 * @property {string} project.code - The code of the project.
 * @property {Object} task - The task associated with the time entry.
 * @property {number} task.id - The ID of the task.
 * @property {string} task.name - The name of the task.
 */

/**
 * @param {object} headers - headers to send to harvest
 * @param {string} from - string of YYYY-MM-DD
 * @param {string} to - string of YYYY-MM-DD
 * @param {string} user_id - User ID to filter on
 * @returns {AsyncGenerator<HarvestTimeEntry, void, *>}
 */
export async function* timeEntryGenerator(headers, from, to, user_id) {
  try {
    const get = async (url, params) => (await axios.get(url, { headers, params })).data;
    let res = await get('https://api.harvestapp.com/v2/time_entries', { from, to, user_id });
    do for (let timeEntry of res.time_entries) yield timeEntry;
    while (res.links.next && (res = await get(res.links.next)));
  } catch (error) {
    console.log(`\x1b[31mAn error occured when attempting to get data from Harvest\x1b[0m`);
    console.log('Response from harvest:', error?.response?.data);
    console.log(`Are the values in \x1b[33m${HARVEST_CONFIG_FILE}\x1b[0m correct?`);
    process.exit(1);
  }
}

/**
 * @param {Date} from
 * @param {Date} to
 */
export async function getWorkHours(from, to) {
  const config = await setupFilesInHomeAndPromptForInfo();

  let hours = 0;
  for await (let timeEntry of timeEntryGenerator(
    config.headers,
    dates.dateToISODateWithoutOffset(from),
    dates.dateToISODateWithoutOffset(to),
    config.userId
  )) {
    const shouldInclude = !applyFilters(config.entriesToIgnore, timeEntry);
    hours += shouldInclude * timeEntry.hours;
  }

  return hours;
}

/**
 * Returns true if the entry matches one of the filters, else false
 * @param {HarvestEntryFilter[]} filters
 * @param {HarvestTimeEntry} entry
 */
export function applyFilters(filters, entry) {
  for (const filter of filters) {
    let projectMatch = true;
    let taskMatch = true;

    if (filter.project && filter.project !== entry.project.name) {
      projectMatch = false;
    }

    if (filter.task && filter.task !== entry.task.name) {
      taskMatch = false;
    }

    if (projectMatch && taskMatch) {
      return true;
    }
  }

  return false;
}

/**
 * @param {{to: Date, from: Date , balance: number}} obj
 * */
export async function afterRun({ balance }) {
  const coreConfig = validateAndProcessBountyConfig(getCoreConfig());

  console.log('referenceDate :>> ', coreConfig.referenceDate.toLocaleDateString('no-NB'));
  console.log('referenceBalance :>> ', coreConfig.referenceBalance);
  console.log('currDate :>> ', new Date().toLocaleDateString('no-NB'));
  console.log('currBalance :>> ', balance);
}
