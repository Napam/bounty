import os from 'os'
import fs from 'fs'
import path from 'path'

const BOUNTY_DIR = path.join(os.homedir(), '.bounty')
const BOUNTY_CONFIG = path.join(BOUNTY_DIR, 'config.json')
const BOUNTY_DATA = path.join(BOUNTY_DIR, 'data.json')

async function setupFilesInHome(configSchema, dataSchema, dir = BOUNTY_DIR, config = BOUNTY_CONFIG) {

  await fs.mkdir(BOUNTY_DIR, { recursive: true }, error => {
    if (error) throw new Error(`Error when attempting to create directory in ${dir}: ${error}`)
  })

  if (!fs.existsSync(BOUNTY_CONFIG))
    fs.writeFileSync(BOUNTY_CONFIG, JSON.stringify(configSchema, null, 4))

  if (!fs.existsSync(BOUNTY_DATA))
    fs.writeFileSync(BOUNTY_DATA, JSON.stringify(dataSchema, null, 4))
}

async function setup(configSchema, dataSchema) {
  setupFilesInHome(configSchema, dataSchema)
}

function getConfig(dir = BOUNTY_CONFIG) {
  return JSON.parse(fs.readFileSync(dir).toString())
}

function getData(dir = BOUNTY_DATA) {
  return JSON.parse(fs.readFileSync(dir).toString())
}

function setConfig(config, path = BOUNTY_CONFIG) {
  fs.writeFileSync(path, JSON.stringify(config, null, 4))
}

function setData(config, path = BOUNTY_DATA) {
  fs.writeFileSync(path, JSON.stringify(config, null, 4))
}

export default {
  setup,
  getConfig,
  setupFilesInHome
}

import { fileURLToPath } from "url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setup()
}