import * as dateUtils from '../../dateUtils.js';
import { setupFilesInHomeAndPromptForInfo, getConfig, timeEntryGenerator } from './utils.js';

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
 * @param {Date} from
 * @param {Date} to
 */
export async function getWorkHours(from, to) {
  const config = getConfig();

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
    dateUtils.dateToISODate(from),
    dateUtils.dateToISODate(to)
  )) {
    hours += zeroIfShouldIgnore(timeEntry) * timeEntry.hours;
  }

  return hours;
}

export function getExpectedRegisteredHoursOnWorkdays() {
  const config = getConfig();
  return config.expectedRegisteredHoursOnWorkdays;
}

export function getExpectedRegisteredHoursOnHolidays() {
  const config = getConfig();
  return config.expectedRegisteredHoursOnHolidays;
}

/**
 * @param {{to: Date, from: Date , balance: number}} obj
 * */
export async function afterRun({ balance }) {
  console.log('referenceDate :>> ', getReferenceDate().toLocaleDateString('no-NB'));
  console.log('referenceBalance :>> ', getReferenceBalance());
  console.log('currDate :>> ', new Date().toLocaleDateString('no-NB'));
  console.log('currBalance :>> ', balance);
}

import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  async function main() {
    await beforeRun();
    const workedHours = await getWorkHours();
    console.log('workedHours :>> ', workedHours);
  }

  main();
}
