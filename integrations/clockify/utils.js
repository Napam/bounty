import fs from 'fs';
import { CONFIG_FILE } from './constants.js';
import inquirer from 'inquirer';
import axios from 'axios';

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
      validate: (input) => input.length > 0
    },
    {
      type: 'input',
      name: 'referenceDate',
      message: 'Enter reference date (YYYY-mm-dd):',
      validate: (input) => input.length > 0
    },
    {
      type: 'input',
      name: 'referenceBalance',
      message: 'Enter reference balance (HH:mm):',
      default: '00:00'
    },
    {
      type: 'input',
      name: 'expectedRegisteredHoursOnWorkdays',
      message: 'Enter length of a regular workday (HH:mm):',
      default: '07:30'
    },
    {
      type: 'input',
      name: 'expectedRegisteredHoursOnHolidays',
      message: 'Enter expected hours registered on a holiday (HH:mm):',
      default: '00:00'
    }
  ]);

  try {
    const response = await axios.get('https://api.clockify.me/api/v1/user', {
      headers: { 'x-api-key': config.apiKey }
    });
    config.userId = response.data.id;
  } catch (error) {
    console.error('Could not obtain userId from clockify', error.response.data);
    process.exit();
  }

  try {
    const response = await axios.get('https://api.clockify.me/api/v1/workspaces', {
      headers: { 'x-api-key': config.apiKey }
    });

    const { workspaceId } = await inquirer.prompt([
      {
        type: 'list',
        message: 'Select a clockify workspace:',
        name: 'workspaceId',
        choices: response.data.map((workspace) => ({ name: workspace.name, value: workspace.id }))
      }
    ]);

    config.workspaceId = workspaceId;
  } catch (error) {
    console.error('Could not obtain workspace data from clockify', error.response.data);
    process.exit();
  }

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_FILE).toString());
}

/**
 * @param {object} headers headers to send to clockify
 * @param {string} from string of YYYY-MM-DDTHH:mm:ssZ
 * @param {string} to string of YYYY-MM-DDTHH:mm:ssZ
 */
export async function* timeEntryGenerator(headers, from, to) {
  try {
    const get = async (url, params) => (await axios.get(url, { headers, params })).data;
    let res = await get('https://api.harvestapp.com/v2/time_entries', { from, to });
    do for (let timeEntry of res.time_entries) yield timeEntry;
    while (res.links.next && (res = await get(res.links.next)));
  } catch (error) {
    console.log(`\x1b[31mAn error occured when attempting to get data from Harvest\x1b[0m`);
    console.log('Attempt to display axios error:', error?.response?.data);
    console.log(`Are the values in \x1b[33m${CONFIG_FILE}\x1b[0m correct?`);
    process.exit();
  }
}
