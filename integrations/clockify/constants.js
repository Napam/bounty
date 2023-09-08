import os from 'os'
import path from 'path'

// Maybe this should be independent of integration?
export const CONFIG_DIR = path.join(os.homedir(), '.bounty')
// Maybe this too?
export const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')
