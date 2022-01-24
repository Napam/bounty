import os from 'os'
import fs from 'fs'
import path from 'path'

const BOUNTY_DIR = path.join(os.homedir(), '.bounty')
const BOUNTY_CONFIG = path.join(BOUNTY_DIR, 'config.json')
const BOUNTY_CONFIG_BASE = {
  'serviceName': '',
  'id': '',
  'authorization': ''
}

/**
 * @param dir 
 * @param config 
 * @param configContent 
 */
async function setupFilesInHome(dir = BOUNTY_DIR, config = BOUNTY_CONFIG, configContent = BOUNTY_CONFIG_BASE) {
  await fs.mkdir(BOUNTY_DIR, { recursive: true }, error => {
    if (error) throw new Error(`Error when attempting to create directory in ${dir}: ${error}`)
  })

  if (!fs.existsSync(BOUNTY_CONFIG))
    fs.writeFileSync(BOUNTY_CONFIG, JSON.stringify(BOUNTY_CONFIG_BASE, null, 4))
}

async function run() {
  setupFilesInHome()
}

export default {
  run
}

import { fileURLToPath } from "url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run()
}