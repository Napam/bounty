import os from 'os'
import fs from 'fs'
import path from 'path'
import axios from 'axios'

const BOUNTY_DIR = path.join(os.homedir(), '.bounty')
const BOUNTY_CONFIG = path.join(BOUNTY_DIR, 'config.json')
const BOUNTY_DATA = path.join(BOUNTY_DIR, 'data.json')

const CONFIG_SCHEMA = {
  headers: {
    'Harvest-Account-ID': null,
    'Authorization': null
  },
  referenceDate: null,
  referenceBalance: null,
}

const DATA_SCHEMA = {
  lastUpdatedDate: null,
  lastUpdatedBalance: null
}

const CACHE_DATA_KEY = 'data'
const CACHE_CONFIG_KEY = 'config'

const cache = {}

export async function setupFilesInHome(configSchema, dataSchema, dir = BOUNTY_DIR, config = BOUNTY_CONFIG) {

  await fs.mkdir(BOUNTY_DIR, { recursive: true }, error => {
    if (error) throw new Error(`Error when attempting to create directory in ${dir}: ${error}`)
  })

  if (!fs.existsSync(BOUNTY_CONFIG))
    fs.writeFileSync(BOUNTY_CONFIG, JSON.stringify(configSchema, null, 4))

  if (!fs.existsSync(BOUNTY_DATA))
    fs.writeFileSync(BOUNTY_DATA, JSON.stringify(dataSchema, null, 4))
}

export async function setup(configSchema = CONFIG_SCHEMA, dataSchema = DATA_SCHEMA) {
  setupFilesInHome(configSchema, dataSchema)
}

export function getConfig(dir = BOUNTY_CONFIG) {
  return JSON.parse(fs.readFileSync(dir).toString())
}

export function getData(dir = BOUNTY_DATA) {
  return JSON.parse(fs.readFileSync(dir).toString())
}

export function setConfig(config, path = BOUNTY_CONFIG) {
  fs.writeFileSync(path, JSON.stringify(config, null, 4))
}

export function setData(config, path = BOUNTY_DATA) {
  fs.writeFileSync(path, JSON.stringify(config, null, 4))
}

export async function getReferenceDate() {
  const data = getData()
  const isodateToDate = isodate => new Date(isodate.split('-'))
  if (data.lastUpdatedDate)
    return isodateToDate(data.lastUpdatedDate)

  const config = getConfig()
  if (config.referenceDate)
    return isodateToDate(config.referenceDate)

  throw new Error("Improper configuration of config")
}

export async function getReferenceBalance() {
  const data = getData()
  if (data.lastUpdatedBalance)
    return data.lastUpdatedBalance

  const config = getConfig()
  if (config.referenceBalance)
    return config.referenceBalance

  throw new Error("Improper configuration of config")
}

export function clean(path = BOUNTY_DIR) {
  fs.rmSync(path, { recursive: true, force: true })
}

export async function* timeEntryGenerator(headers, from) {
  const get = async (url, params) => (await axios.get(url, { headers, params })).data
  let res = await get('https://api.harvestapp.com/v2/time_entries', { from })
  do for (let timeEntry of res.time_entries) yield timeEntry
  while (res.links.next && (res = await get(res.links.next)))
}

const taskLeavePaid = {
  task: {
    id: 17810723,
    name: 'Leave - Paid'
  }
}

const EXCLUSION_IDS = new Set([taskLeavePaid.id])

export async function getWorkHours() {
  const config = getConfig()
  const data = getData()

  if (data.lastUpdatedDate === null)
    data.lastUpdatedDate = config.referenceDate

  if (data.lastUpdatedBalance === null)
    data.lastUpdatedBalance = config.referenceBalance

  let hours = 0
  for await (let timeEntry of timeEntryGenerator(config.headers, data.lastUpdatedDate))
    if (EXCLUSION_IDS.has(timeEntry.task.id))
      continue
    else
      hours += timeEntry.hours

  return hours
}

import { fileURLToPath } from "url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  async function main() {
    await setup()
    const workedHours = await getWorkHours()
    console.log('workedHours :>> ', workedHours);
  }

  main()
}