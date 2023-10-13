import os from 'os';
import path from 'path';

export const BOUNTY_CONFIG_DIR = path.join(os.homedir(), '.bounty');
export const BOUNTY_CORE_CONFIG_FILE = path.join(BOUNTY_CONFIG_DIR, 'config.json');
