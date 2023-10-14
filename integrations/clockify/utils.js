import fs from 'fs';
import { CONFIG_FILE } from './constants.js';
import inquirer from 'inquirer';
import axios from 'axios';

/**
 * @typedef {Object} ClockifyConfig
 * @property {string} apiKey - The API key.
 * @property {string} referenceDate - The reference date in YYYY-MM-DD format.
 * @property {string} referenceBalance - The reference balance in HH:MM format.
 * @property {string} expectedRegisteredHoursOnWorkdays - The expected registered hours on workdays in HH:MM format.
 * @property {string} expectedRegisteredHoursOnHolidays - The expected registered hours on holidays in HH:MM format.
 * @property {string} userId - The user ID.
 * @property {string} workspaceId - The workspace ID.
 */

/**
 * @returns {Promise<ClockifyConfig>}
 */
export async function setupFilesInHomeAndPromptForInfo() {
  if (fs.existsSync(CONFIG_FILE)) {
    return;
  }

  const config = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiKey',
      message:
        'Go to https://app.clockify.me/user/settings and obtain an api key and paste it here:',
      validate: (input) => input.length > 0,
    },
    {
      type: 'input',
      name: 'referenceDate',
      message: 'Enter reference date (YYYY-mm-dd):',
      validate: (input) => input.length > 0,
    },
    {
      type: 'input',
      name: 'referenceBalance',
      message: 'Enter reference balance (HH:mm):',
      default: '00:00',
    },
    {
      type: 'input',
      name: 'expectedRegisteredHoursOnWorkdays',
      message: 'Enter length of a regular workday (HH:mm):',
      default: '07:30',
    },
    {
      type: 'input',
      name: 'expectedRegisteredHoursOnHolidays',
      message: 'Enter expected hours registered on a holiday (HH:mm):',
      default: '00:00',
    },
  ]);

  try {
    const response = await axios.get('https://api.clockify.me/api/v1/user', {
      headers: { 'x-api-key': config.apiKey },
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

  config.version = '1'

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
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

const hhmmRegex = /^(\d+):(\d+)$/;

/**
 * @param {string} hhmm - string in HH:MM format, can also be like 1234:456
 * @returns {number}
 */
export function parseHHMM(hhmm) {
  if (!hhmmRegex.test(hhmm)) {
    throw new Error(`Invalid HH:MM string: ${hhmm}`);
  }

  const [hoursString, minutesString] = hhmm.split(':');
  return parseInt(hoursString) + parseInt(minutesString) / 60;
}
