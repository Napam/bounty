import * as dates from '../../core/dates.js';
import { setupFilesInHomeAndPromptForInfo } from './configuration.js';
import { HARVEST_CONFIG_FILE } from './constants.js';
import axios from 'axios';
import { getConfig as getCoreConfig, validateAndProcessBountyConfig } from '../../cli/configure.js';

/**
 * @param {object} headers headers to send to harvest
 * @param {string} from string of YYYY-MM-DD
 * @param {string} to string of YYYY-MM-DD
 */
export async function* timeEntryGenerator(headers, from, to) {
  try {
    const get = async (url, params) => (await axios.get(url, { headers, params })).data;
    let res = await get('https://api.harvestapp.com/v2/time_entries', { from, to });
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

  const zeroIfShouldIgnore = (timeEntry) => {
    for (const { project: projectName, task: taskName } of config.entriesToIgnore) {
      if (timeEntry.project.name === projectName && timeEntry.task.name === taskName) {
        return 0;
      }
    }
    return 1;
  };

  let hours = 0;
  for await (let timeEntry of timeEntryGenerator(
    config.headers,
    dates.dateToISODateWithoutOffset(from),
    dates.dateToISODateWithoutOffset(to)
  )) {
    hours += zeroIfShouldIgnore(timeEntry) * timeEntry.hours;
  }

  return hours;
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
