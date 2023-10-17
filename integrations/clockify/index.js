import { setupFilesInHomeAndPromptForInfo, getConfig  } from './utils.js';
import axios from 'axios';
import * as dates from '../../core/dates.js';

export async function beforeRun() {
  await setupFilesInHomeAndPromptForInfo();
}

/**
 * @typedef {Object} ClockifyDashboardInfoResponse
 * @property {string} totalTime - Total time in the format of PT(?<hours>\d+)H(?<minutes>\d+)M.
 */

/**
 * @param {Date} from
 * @param {Date} to
 */
export async function getWorkHours(from, to) {
  const config = getConfig();
  const workspaceId = config.workspaceId;

  const startDate = dates.dateToISODatetimeWithoutOffset(dates.offsetDate(from));
  const endDate = dates.dateToISODatetimeWithoutOffset(dates.offsetDate(to, { days: 1, seconds: -1 }));

  /** @type {ClockifyDashboardInfoResponse} */
  let result;
  try {
    result = (
      await axios.post(
        `https://global.api.clockify.me/workspaces/${workspaceId}/reports/dashboard-info`,
        {
          startDate,
          endDate,
          access: 'ME',
          type: 'PROJECT',
        },
        {
          headers: {
            'X-Api-Key': config.apiKey,
          },
        }
      )
    ).data;
  } catch (error) {
    console.error('Could not get data from clockify:', error);
    process.exit();
  }

  const { hours, minutes } = dates.parseISODuration(result.totalTime);
  const workHours = hours + minutes / 60;
  return workHours;
}

/**
 * @param {number} num
 * @returns {string}
 */
function numberToHHMM(num) {
  const hours = Math.floor(num);
  const minutes = Math.round((num - hours) * 60);
  const hoursStr = hours.toString().padStart(2, '0');
  const minutesStr = minutes.toString().padStart(2, '0');
  return `${hoursStr}:${minutesStr}`;
}

/**
 * @param {{to: Date, from: Date , balance: number}} obj
 * */
export async function afterRun({ balance }) {
  console.log('Flex balance:', numberToHHMM(balance));
}
