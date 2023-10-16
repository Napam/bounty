import { setupFilesInHomeAndPromptForInfo, getConfig, parseHHMM } from './utils.js';
import axios from 'axios';
import * as dateUtils from '../../dateUtils.js';

export async function beforeRun() {
  await setupFilesInHomeAndPromptForInfo();
}

function isodateToDate(isoDate) {
  let [year, month, day] = isoDate.split('-').map((x) => parseInt(x));
  return new Date(year, month - 1, day);
}

export function getReferenceDate() {
  const config = getConfig();
  if (config.referenceDate == null) {
    throw new Error('Improper configuration of config');
  }

  return isodateToDate(config.referenceDate);
}

export function getReferenceBalance() {
  const config = getConfig();
  if (config.referenceBalance == null) {
    throw new Error('Improper configuration of config');
  }

  return parseHHMM(config.referenceBalance);
}

/**
 * @typedef {Object} ClockifyDashboardInfoResponse
 * @property {string} totalTime - Total time in the format of PT(?<hours>\d+)H(?<minutes>\d+)M.
 */

const clockifyTimeRegex = /PT((?<hours>\d+)H)?((?<minutes>\d+)M)?/;

/**
 * @param {Date} from
 * @param {Date} to
 */
export async function getWorkHours(from, to) {
  const config = getConfig();
  const workspaceId = config.workspaceId;

  const startDate = dateUtils.dateToISODatetimeWithoutOffset(dateUtils.offsetDate(from));
  const endDate = dateUtils.dateToISODatetimeWithoutOffset(dateUtils.offsetDate(to, { days: 1, seconds: -1 }));

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

  let {
    groups: { hours: hoursString, minutes: minutesString },
  } = clockifyTimeRegex.exec(result.totalTime);

  hoursString = hoursString ?? '0';
  minutesString = minutesString ?? '0';

  const workHours = parseInt(hoursString) + parseInt(minutesString) / 60;
  return workHours;
}

export function getExpectedRegisteredHoursOnWorkdays() {
  const config = getConfig();
  if (!config.expectedRegisteredHoursOnWorkdays == null) {
    throw new Error('Improper configuration of config');
  }

  return parseHHMM(config.expectedRegisteredHoursOnWorkdays);
}

export function getExpectedRegisteredHoursOnHolidays() {
  const config = getConfig();
  if (config.expectedRegisteredHoursOnHolidays == null) {
    throw new Error('Improper configuration of config');
  }

  return parseHHMM(config.expectedRegisteredHoursOnHolidays);
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
