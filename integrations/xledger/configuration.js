import fs from 'fs';
import { XLEDGER_CONFIG_FILE } from './constants.js';
import inquirer from 'inquirer';
import yup from 'yup';
import { replaceEnvPlaceholders } from '../../core/placeholders.js';

/**
 * @typedef {Object} XLedgerEntryFilter
 * @property {string} projectName
 * @property {string} clientName
 * @property {string} label
 */

/**
 * @typedef {Object} XLedgerConfig
 * @property {string} apiKey - The API key.
 * @property {number} employeeId - The employee ID. Is employeeDbId in XLedger
 */

// Not really used yet, the API key I have at the moment don't have permission
// to view project information
//
// const XLedgerEntryFilterSchema = yup
//   .object()
//   .shape({
//     projectName: yup.string(),
//     clientName: yup.string(),
//     label: yup.string(),
//   })
//   .test((value, ctx) => {
//     if (!Object.entries(value).length) {
//       return ctx.createError({
//         message: `entriesToIgnore filters cannot be empty, but found empty object at ${ctx.path}`,
//       });
//     }
//     return true;
//   });

const XLedgerConfigSchema = yup.object().shape({
  apiKey: yup.string().required(),
  employeeId: yup.number().required(),
  // entriesToIgnore: yup.array().of(XLedgerEntryFilterSchema).required(),
});

/**
 * @param {XLedgerConfig} config
 */
function validateXLedgerConfig(config) {
  try {
    return XLedgerConfigSchema.validateSync(config, { strict: true });
  } catch (error) {
    console.error(
      `\x1b[31mError while processing config file \x1b[33m${XLEDGER_CONFIG_FILE}\x1b[m:\n${error}`
    );
    process.exit(1);
  }
}

/**
 * @returns {Promise<XLedgerConfig>}
 */
export async function setupFilesInHomeAndPromptForInfo() {
  if (fs.existsSync(XLEDGER_CONFIG_FILE)) {
    const validated = validateXLedgerConfig(getConfig());
    return replaceEnvPlaceholders(process.env, validated, XLEDGER_CONFIG_FILE);
  }

  const config = { version: '1' };

  const { apiKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiKey',
      message: 'API Key, needs to be obtained from XLedger admin:',
      validate: (input) => input.length > 0,
    },
  ]);
  config.apiKey = apiKey;

  const { employeeId } = await inquirer.prompt([
    {
      type: 'input',
      name: 'employeeId',
      message: 'Employee ID, in XLedger it is your database id called "employeeDbId":',
      validate: (input) => input.length > 0,
    },
  ]);
  config.employeeId = Number(employeeId);

  const validatedConfig = validateXLedgerConfig(config);

  console.log();
  console.log(`XLedger config \x1b[32msuccessfully\x1b[m updated at \x1b[33m${XLEDGER_CONFIG_FILE}\x1b[m`);
  console.log(`Please assert that the values so far are correct before you continue:`);
  console.log(validatedConfig);
  const { confirm } = await inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: 'Confirm to continue',
  });

  if (!confirm) {
    console.log('Exiting...');
    process.exit(0);
  }

  fs.writeFileSync(XLEDGER_CONFIG_FILE, JSON.stringify(validatedConfig, null, 2));
  return replaceEnvPlaceholders(validatedConfig, XLEDGER_CONFIG_FILE);
}

/** @type {XLedgerConfig | null} */
let _config = null;

/** @returns {XLedgerConfig} */
export function getConfig() {
  if (_config != null) {
    return _config;
  }
  _config = JSON.parse(fs.readFileSync(XLEDGER_CONFIG_FILE).toString());
  return _config;
}
