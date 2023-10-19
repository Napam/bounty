import fs from 'fs';
import { CONFIG_FILE } from './constants.js';
import inquirer from 'inquirer';
import axios from 'axios';

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

/**
 * @returns {Promise<ClockifyConfig>}
 */
export async function setupFilesInHomeAndPromptForInfo() {
  if (fs.existsSync(CONFIG_FILE)) {
    return getConfig();
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

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  return config;
}

/** @type {ClockifyConfig | null} */
let config = null;

/** @returns {ClockifyConfig} */
export function getConfig() {
  if (config != null) {
    return config;
  }
  config = JSON.parse(fs.readFileSync(CONFIG_FILE).toString());
  return config;
}
