import fs from 'fs'
import axios from 'axios'
import readline from 'readline'
import {
  CONFIG_DIR,
  CONFIG_FILE
} from './constants.js'


export async function setupFilesInHome() {
  const bootstrapFiles = async () => {
    await fs.mkdir(CONFIG_DIR, { recursive: true }, error => {
      if (error) throw new Error(`Error when attempting to create directory in ${CONFIG_DIR}: ${error}`)
    })
    return fs.existsSync(CONFIG_FILE) ? getConfig() : {}
  }
  // Now assume config file has never been incorrectly altered
  let config = await bootstrapFiles()
  const migrationFunctions = (await import('./migrations.js')).default
  for (let f of migrationFunctions)
    config = await f(config)
  setConfig(config)
}

export function cleanConfig() {
  fs.rmSync(CONFIG_DIR, { recursive: true, force: true })
}

/**
 * Assumes config exists and is at latest migration
 */
export async function promptForInfo(configDir = CONFIG_FILE) {
  const config = getConfig()
  if (config.headers['Harvest-Account-ID'] !== null && config.headers['Authorization'] !== null)
    return

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const question = string => new Promise(resolve => rl.question(string, resolve))

  console.log('Go to \x1b[33mhttps://id.getharvest.com/developers\x1b[m')
  console.log('Press "Create new personal access token" if you dont have one')
  const token = await question('Copy and paste your token here: ')
  const accountid = await question('Copy and paste Account ID here: ')
  const referenceDate = await question('Enter reference date (YYYY-MM-DD): ')
  const referenceBalance = await question('Enter reference flextime balance (float): ')
  const expectedWorkHoursPerDay = await question('Enter expected registered hours per day (float, default 7.5): ')

  console.log('Got token: ', token);
  console.log('Got Account Id: ', accountid);
  config.headers['Authorization'] = 'Bearer ' + token
  config.headers['Harvest-Account-ID'] = accountid
  config.referenceDate = referenceDate
  config.referenceBalance = parseFloat(referenceBalance)
  config.expectedWorkHoursPerDay = expectedWorkHoursPerDay.length ? parseFloat(expectedWorkHoursPerDay) : 7.5
  setConfig(config)
  console.log()
  console.log(`Config \x1b[32msuccessfully\x1b[m saved at \x1b[33m${configDir}\x1b[m`)
  console.log()
  console.log(`If something crashes, make sure that the config values makes sense:`)
  console.log(config)
  await question('Press enter to continue')
  rl.close()
}

export function getConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_FILE).toString())
}

export function setConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 4))
}

/**
 * 
 * @param {object} headers headers to send to harvest
 * @param {string} from string of YYYY-MM-DD
 */
export async function* timeEntryGenerator(headers, from) {
  try {
    const get = async (url, params) => (await axios.get(url, { headers, params })).data
    let res = await get('https://api.harvestapp.com/v2/time_entries', { from })
    do for (let timeEntry of res.time_entries) yield timeEntry
    while (res.links.next && (res = await get(res.links.next)))
  } catch (error) {
    console.log(`\x1b[31mAn error occured when attempting to get data from Harvest\x1b[0m`)
    console.log('Attempt to display axios error:', error?.response?.data)
    console.log(`Are the values in \x1b[33m${CONFIG_FILE}\x1b[0m correct?`)
    process.exit()
  }
}
