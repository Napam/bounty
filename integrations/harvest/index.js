import * as dates from '../../core/dates.js';
import { setupFilesInHomeAndPromptForInfo, timeEntryGenerator } from './utils.js';

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
