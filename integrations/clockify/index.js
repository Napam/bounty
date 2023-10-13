import { setupFilesInHomeAndPromptForInfo, getConfig } from './utils.js';
import axios from 'axios';

export async function beforeRun() {
  await setupFilesInHomeAndPromptForInfo();
}

function isodateToDate(isoDate) {
  let [year, month, day] = isoDate.split('-').map((x) => parseInt(x));
  return new Date(year, month - 1, day);
}

export function getReferenceDate() {
  const config = getConfig();
  if (config.referenceDate) return isodateToDate(config.referenceDate);

  throw new Error('Improper configuration of config');
}

export function getReferenceBalance() {
  const config = getConfig();
  if (config.referenceBalance != null) return config.referenceBalance;

  throw new Error('Improper configuration of config');
}

/**
 * @typedef {Object} ClockifyDashboardInfoResponse
 * @property {string} totalTime - Total time in the format of PT(?<hours>\d+)H(?<minutes>\d+)M.
 */

const clockifyTimeRegex = /PT(?<hours>\d+)H(?<minutes>\d+)M/;

export async function getWorkHours() {
  const config = getConfig();
  const workspaceId = config.workspaceId;

  /** @type {ClockifyDashboardInfoResponse} */
  let result;
  try {
    result = (
      await axios.post(
        `https://global.api.clockify.me/workspaces/${workspaceId}/reports/dashboard-info`,
        {
          startDate: new Date(config.referenceDate).toISOString(),
          endDate: new Date().toISOString(),
          access: 'ME',
          type: 'PROJECT'
        },
        {
          headers: {
            'X-Api-Key': config.apiKey
          }
        }
      )
    ).data;
  } catch (error) {
    console.error('Could not get data from clockify:', error);
    process.exit();
  }

  const {
    groups: { hours: hoursString, minutes: minutesString }
  } = clockifyTimeRegex.exec(result.totalTime);

  const workHours = parseInt(hoursString) + parseInt(minutesString) / 60;
}

export function getExpectedRegisteredHoursOnWorkdays() {
  const config = getConfig();
  if (config.expectedRegisteredHoursOnWorkdays) return config.expectedRegisteredHoursOnWorkdays;

  throw new Error('Improper configuration of config');
}

export function getExpectedRegisteredHoursOnHolidays() {
  const config = getConfig();
  if (config.expectedRegisteredHoursOnHolidays) return config.expectedRegisteredHoursOnHolidays;

  throw new Error('Improper configuration of config');
}

export async function afterRun({ from, to, balance }) {
  console.log(balance);
}
