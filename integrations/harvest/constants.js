import os from 'os'
import path from 'path'

export const BOUNTY_DIR = path.join(os.homedir(), '.bounty')
export const BOUNTY_CONFIG = path.join(BOUNTY_DIR, 'config.json')

export const CONFIG_SCHEMA = {
  headers: {
    'Harvest-Account-ID': null,
    'Authorization': null
  },
  referenceDate: null,
  referenceBalance: null,
}

export const timeOffEntry = {
  task: {
    id: 18097850,
    name: 'Time off'
  }
}

export const IGNORE_IDS = new Set([
  timeOffEntry.task.id,
  18076986
])