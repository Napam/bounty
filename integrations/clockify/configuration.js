import fs from 'fs';
import { CLOCKIFY_CONFIG_FILE } from './constants.js';
import inquirer from 'inquirer';
import axios from 'axios';
import yup from 'yup';

/**
 * @typedef {Object} IgnoreEntryFilter
 * @property {string} projectName
 * @property {string} clientName
 * @property {string} label
 */

/**
 * @typedef {Object} ClockifyConfig
 * @property {string} apiKey - The API key.
 * @property {string} userId - The user ID.
 * @property {string} workspaceId - The workspace ID.
 * @property {IgnoreEntryFilter[]} entriesToIgnore - Entries that are to be ignored, e.g. vacation entries
 */

const IgnoreEntryFilterSchema = yup.object().shape({
  projectName: yup.string(),
  clientName: yup.string(),
  label: yup.string(),
});

const ClockifyConfigSchema = yup.object().shape({
  apiKey: yup.string().required(),
  userId: yup.string().required(),
  workspaceId: yup.string().required(),
  entriesToIgnore: yup.array().of(IgnoreEntryFilterSchema).required(),
});

/**
 * @param {ClockifyConfig} config
 */
function validateClockifyConfig(config) {
  try {
    return ClockifyConfigSchema.validateSync(config, { strict: true });
  } catch (error) {
    console.error(
      `\x1b[31mError while processing config file \x1b[33m${CLOCKIFY_CONFIG_FILE}\x1b[m:\n${error}`
    );
    process.exit(1);
  }
}

/**
 * @returns {Promise<ClockifyConfig>}
 */
export async function setupFilesInHomeAndPromptForInfo() {
  if (fs.existsSync(CLOCKIFY_CONFIG_FILE)) {
    return validateClockifyConfig(getConfig());
  }

  const config = { version: '1' };

  const { apiKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiKey',
      message: 'Go to https://app.clockify.me/user/settings and obtain an api key and paste it here:',
      validate: (input) => input.length > 0,
    },
  ]);

  config.apiKey = apiKey;

  try {
    const response = await axios.get('https://api.clockify.me/api/v1/user', {
      headers: { 'X-Api-Key': config.apiKey },
    });
    config.userId = response.data.id;
  } catch (error) {
    console.error('Could not obtain userId from clockify', error.response.data);
    process.exit();
  }

  try {
    const response = await axios.get('https://api.clockify.me/api/v1/workspaces', {
      headers: { 'X-Api-Key': config.apiKey },
    });

    const { workspaceId } = await inquirer.prompt([
      {
        type: 'list',
        message: 'Select a clockify workspace:',
        name: 'workspaceId',
        choices: response.data.map((workspace) => ({ name: workspace.name, value: workspace.id })),
      },
    ]);

    config.workspaceId = workspaceId;
  } catch (error) {
    console.error('Could not obtain workspace data from clockify', error.response.data);
    process.exit();
  }

  config.entriesToIgnore = [];

  const validatedConfig = validateClockifyConfig(config)
  fs.writeFileSync(CLOCKIFY_CONFIG_FILE, JSON.stringify(validatedConfig, null, 2));
  return validatedConfig;
}

/** @type {ClockifyConfig | null} */
let _config = null;

/** @returns {ClockifyConfig} */
export function getConfig() {
  if (_config != null) {
    return _config;
  }
  _config = JSON.parse(fs.readFileSync(CLOCKIFY_CONFIG_FILE).toString());
  return _config;
}