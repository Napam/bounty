import { setupFilesInHomeAndPromptForInfo } from './configuration.js';
import axios from 'axios';
import * as dates from '../../core/dates.js';

/**
 * @typedef {import('./configuration.js').ClockifyConfig} ClockifyConfig
 * @typedef {import('./configuration.js').ClockifyEntryFilter} ClockifyEntryFilter
 */

/**
 * @typedef {Object} ProjectAndTotalTime
 * @property {string} projectName - The name of the project.
 * @property {string} label - Arbitrary label, seemingly name of project by default
 * @property {string} clientName - Client name
 * @property {string} percentage - Percentage spent relative to everything else in the time span
 * @property {string} color - Hex color in Clockify dashboard
 * @property {number} earned - Earned
 * @property {string} billableDuration - Format of PT(?<hours>\d+)H(?<minutes>\d+)M
 * @property {string} duration - The total time spent on the project in format of PT(?<hours>\d+)H(?<minutes>\d+)M
 */

/**
 * @typedef {Object} ClockifyDashboardInfoResponse
 * @property {string} totalTime - Total time in the format of PT(?<hours>\d+)H(?<minutes>\d+)M.
 * @property {Record<string, ProjectAndTotalTime>} projectAndTotalTime - An object containing the name and total time spent on each project. Keys are IDs.
 * @property {Record<string, ProjectAndTotalTime>} dateAndtotalTime - An object containing the name and total time spent on each project. Keys are ISO dates.
 */

/**
 * @param {Date} from
 * @param {Date} to
 */
export async function getWorkHours(from, to) {
  const config = await setupFilesInHomeAndPromptForInfo();
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

  let hoursToIgnore = 0;
  for (const entry of Object.values(result.projectAndTotalTime)) {
    for (const filters of config.entriesToIgnore) {
      const shouldIgnore = determineIfShouldIgnore(filters, entry);
      hoursToIgnore += shouldIgnore * dates.ISODurationSubsetToHours(entry.duration);
    }
  }

  const { hours, minutes } = dates.parseISODuration(result.totalTime);
  const workHours = hours + minutes / 60;
  return Math.max(workHours - hoursToIgnore, 0);
}

/**
 * @param {ClockifyEntryFilter[]} filters
 * @param {ProjectAndTotalTime} entry
 */
export function determineIfShouldIgnore(filters, entry) {
  for (const [keyToIgnore, valueToIgnore] of Object.entries(filters)) {
    if (!(entry[keyToIgnore] === valueToIgnore)) {
      return false;
    }
  }
  return true;
}

/**
 * @param {number} num
 * @returns {string}
 */
export function numberToHHMM(num) {
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
