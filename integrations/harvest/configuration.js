import fs from 'fs';
import readline from 'readline';
import { CONFIG_FILE } from './constants.js';

/**
 * @typedef {Object} HarvestConfig
 * @property {string} version - The version of the config.
 * @property {Object} headers - The headers for the request.
 * @property {string} headers.Harvest-Account-ID - The Harvest Account ID.
 * @property {string} headers.Authorization - The Authorization token.
 * @property {Array<{project: string, task: string}>} entriesToIgnore - An array of entries to ignore.
 * @returns {Promise<HarvestConfig>}
 */

export async function setupFilesInHomeAndPromptForInfo() {
  const bootstrapFiles = async () => {
    return fs.existsSync(CONFIG_FILE) ? getConfig() : {};
  };

  // Now assume config file has never been incorrectly altered
  let initConfig = await bootstrapFiles();
  const migrationFunctions = (await import('./migrations.js')).default;
  let currConfig = initConfig;
  for (let f of migrationFunctions) {
    currConfig = await f(currConfig);
  }

  if (currConfig === initConfig) {
    return initConfig;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (string) => new Promise((resolve) => rl.question(string, resolve));

  setConfig(currConfig);
  console.log();
  console.log(`Harvest config \x1b[32msuccessfully\x1b[m updated at \x1b[33m${CONFIG_FILE}\x1b[m`);
  console.log();
  console.log(`If something crashes, make sure that the config values makes sense:`);
  console.log(currConfig);
  await question('Press enter to continue');
  rl.close();
  return currConfig;
}

/** @type {ClockifyConfig | null} */
let config = null;

/**
 * @returns {HarvestConfig}
 */
export function getConfig() {
  if (config != null) {
    return config;
  }
  config = JSON.parse(fs.readFileSync(CONFIG_FILE).toString());
  return config;
}

export function setConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 4));
}
