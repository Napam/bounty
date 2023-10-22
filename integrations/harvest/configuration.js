import fs from 'fs';
import { HARVEST_CONFIG_FILE } from './constants.js';
import yup from 'yup';
import inquirer from 'inquirer';

/**
 * @typedef {Object} HarvestEntryFilter
 * @property {string} project
 * @property {string} task
 */

/**
 * @typedef {Object} HarvestConfig
 * @property {string} version - The version of the config.
 * @property {string} userId - ID that will be used to filter time entries. Not the same as Harvest-Account-ID.
 * @property {Object} headers - The headers for the request.
 * @property {string} headers.Harvest-Account-ID - The Harvest Account ID.
 * @property {string} headers.Authorization - The Authorization token.
 * @property {HarvestEntryFilter[]} entriesToIgnore - An array of entries to ignore.
 */

const EntryToIgnoreSchema = yup
  .object()
  .shape({
    project: yup.string(),
    task: yup.string(),
  })
  .test((value, ctx) => {
    if (!Object.entries(value).length) {
      return ctx.createError({
        message: `entriesToIgnore filters cannot be empty, but found empty object at ${ctx.path}`,
      });
    }
    return true;
  });

const HarvestConfigSchema = yup.object().shape({
  version: yup.string().required(),
  headers: yup.object().shape({
    'Harvest-Account-ID': yup.string().required(),
    Authorization: yup.string().required(),
  }),
  userId: yup.number().required(),
  entriesToIgnore: yup.array().of(EntryToIgnoreSchema).required(),
});

/**
 * @param {HarvestConfig} config
 */
function validateHarvestConfig(config) {
  try {
    return HarvestConfigSchema.validateSync(config, { strict: true });
  } catch (error) {
    console.error(
      `\x1b[31mError while processing config file \x1b[33m${HARVEST_CONFIG_FILE}\x1b[m:\n${error}`
    );
    process.exit(1);
  }
}

export async function setupFilesInHomeAndPromptForInfo() {
  const bootstrapFiles = async () => {
    return fs.existsSync(HARVEST_CONFIG_FILE) ? getConfig() : {};
  };

  // Now assume config file has never been incorrectly altered
  let initConfig = await bootstrapFiles();
  const migrationFunctions = (await import('./migrations.js')).default;
  let currConfig = initConfig;
  for (let f of migrationFunctions) {
    currConfig = await f(currConfig);
  }

  if (currConfig === initConfig) {
    return validateHarvestConfig(initConfig);
  }
  const validatedConfig = validateHarvestConfig(currConfig);
  console.log();
  console.log(`Harvest config \x1b[32msuccessfully\x1b[m updated at \x1b[33m${HARVEST_CONFIG_FILE}\x1b[m`);
  console.log(
    `The installation wizard only configures some of the possible values. Make sure to properly configure all relevant values at \x1b[33m${HARVEST_CONFIG_FILE}\x1b[m`
  );
  console.log(`If something crashes, make sure that the config values makes sense:`);
  console.log(currConfig);
  const { confirm } = await inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: 'Confirm to continue',
  });

  if (!confirm) {
    console.log('Exiting...');
    process.exit(0);
  }
  setConfig(validatedConfig);
  return validatedConfig;
}

/** @type {ClockifyConfig | null} */
let _config = null;

/**
 * @returns {HarvestConfig}
 */
export function getConfig() {
  if (_config != null) {
    return _config;
  }
  _config = JSON.parse(fs.readFileSync(HARVEST_CONFIG_FILE).toString());
  return _config;
}

export function setConfig(config) {
  _config = null;
  fs.writeFileSync(HARVEST_CONFIG_FILE, JSON.stringify(config, null, 4));
}
