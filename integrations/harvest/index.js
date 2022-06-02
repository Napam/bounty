
import dateUtils from '../../dateUtils.js'

import {
  CONFIG_SCHEMA,
  IGNORE_IDS
} from './constants.js'

import {
  setupFilesInHome,
  promptForInfo,
  getConfig,
  timeEntryGenerator
} from './utils.js'

export async function beforeRun(configSchema = CONFIG_SCHEMA) {
  await setupFilesInHome(configSchema)
  await promptForInfo()
}

export function getReferenceDate() {
  const isodateToDate = isodate => new Date(isodate.split('-'))

  const config = getConfig()
  if (config.referenceDate)
    return isodateToDate(config.referenceDate)

  throw new Error("Improper configuration of config")
}

export function getReferenceBalance() {
  const config = getConfig()
  if (config.referenceBalance != null)
    return config.referenceBalance

  throw new Error("Improper configuration of config")
}

export async function getWorkHours() {
  const config = getConfig()
  let from = dateUtils.offsetISODate(
    config.referenceDate,
    { days: dateUtils.ISOToMs(config.referenceDate) < dateUtils.getTodayDate().getTime() }
  )

  let hours = 0
  for await (let timeEntry of timeEntryGenerator(config.headers, from))
    hours += !IGNORE_IDS.has(timeEntry.task.id) * timeEntry.hours

  return hours
}

export async function afterRun({ from, to, balance }) {
  console.log('referenceDate :>> ', getReferenceDate().toLocaleDateString("no-NB"));
  console.log('referenceBalance :>> ', getReferenceBalance());
  console.log('currDate :>> ', new Date().toLocaleDateString("no-NB"));
  console.log('currBalance :>> ', balance);
}

import { fileURLToPath } from "url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  async function main() {
    await beforeRun()
    const workedHours = await getWorkHours()
    console.log('workedHours :>> ', workedHours);
  }

  main()
}
