import fs from 'fs'
import axios from 'axios'
import readline from 'readline'
import {
  BOUNTY_DIR,
  BOUNTY_CONFIG,
  IGNORE_IDS
} from './constants.js'

export async function setupFilesInHome(configSchema) {
  await fs.mkdir(BOUNTY_DIR, { recursive: true }, error => {
    if (error) throw new Error(`Error when attempting to create directory in ${BOUNTY_DIR}: ${error}`)
  })

  if (!fs.existsSync(BOUNTY_CONFIG))
    fs.writeFileSync(BOUNTY_CONFIG, JSON.stringify(configSchema, null, 4))
}

/**
 * Assumes config exists
 */
export async function prompt(configDir = BOUNTY_CONFIG) {
  const config = getConfig()
  if (config.headers['Harvest-Account-ID'] !== null && config.headers['Authorization'] !== null)
    return

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const question = string => new Promise(resolve => rl.question(string, resolve))

  console.log('Go to https://id.getharvest.com/developers')
  console.log('Press "Create new personal access token" if you dont have one')
  const token = await question("Copy and paste your token here: ")
  const accountid = await question("Copy and paste Account ID here: ")
  const referenceDate = await question("Enter reference date (YYYY-MM-DD): ")
  const referenceBalance = await question("Enter reference flextime balance (float): ")
  rl.close()

  console.log('Got token: ', token);
  console.log('Got Account Id: ', accountid);
  config.headers['Authorization'] = 'Bearer ' + token
  config.headers['Harvest-Account-ID'] = accountid
  config.referenceDate = referenceDate
  config.referenceBalance = parseFloat(referenceBalance)
  setConfig(config)
  console.log(`Config successfully saved at ${configDir}`)
  console.log(`If something crashes, make sure that the config values makes sense`)
}

export function getConfig() {
  return JSON.parse(fs.readFileSync(BOUNTY_CONFIG).toString())
}

export function setConfig(config) {
  fs.writeFileSync(BOUNTY_CONFIG, JSON.stringify(config, null, 4))
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
    console.log(`Are the values in \x1b[33m${BOUNTY_CONFIG}\x1b[0m correct?`)
    process.exit()
  }
}