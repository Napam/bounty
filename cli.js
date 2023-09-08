#!/usr/bin/env node

import fs from 'fs';
import dateUtils from './dateUtils.js';
import { CONFIG_DIR, CONFIG_FILE } from './constants.js';
import inquirer from 'inquirer';

/**
 * Config file
 * @typedef {Object} Config
 * @property {string} version
 * @property {'harvest' | 'clockify'} integration
 */

async function initalizeBountyConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    return getConfig();
  }

  fs.mkdir(CONFIG_DIR, { recursive: true }, (error) => {
    if (error) {
      throw new Error(`Error when attempting to create directory ${CONFIG_DIR}: ${error}`);
    }
  });

  const { integration } = await inquirer.prompt({
    type: 'list',
    name: 'integration',
    message: 'Select the time registration system that you use:',
    choices: [
      { name: 'Harvest', value: 'harvest' },
      { name: 'Clockify', value: 'clockify' }
    ]
  });

  const config = { version: '1', integration };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  return config;
}

/**
 * @param
 * @returns {Config} Bounty configuration
 */
function getConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_FILE).toString());
}

/**
 * @param {Config} config
 */
async function getIntegration(config) {
  return await import(
    {
      harvest: './integrations/harvest/index.js',
      clockify: './integrations/clockify/index.js'
    }[config.integration]
  );
}

function incrementDateIfBeforeToday(date) {
  return dateUtils.offsetDate(date, {
    days: date.getTime() < dateUtils.getTodayDate().getTime()
  });
}

async function run() {
  const config = await initalizeBountyConfig();
  const integration = await getIntegration(config);

  await integration.beforeRun();
  const workedHours = await integration.getWorkHours();
  const hoursOnWorkdays = integration.getExpectedRegisteredHoursOnWorkdays();
  const hoursOnHolidays = integration.getExpectedRegisteredHoursOnHolidays();
  const referenceDate = await integration.getReferenceDate();
  const referenceBalance = await integration.getReferenceBalance();
  const from = incrementDateIfBeforeToday(referenceDate);
  const to = dateUtils.getTodayDate();
  const balance = dateUtils.calcFlexBalance(workedHours, from, referenceBalance, {
    to,
    hoursOnWorkdays,
    hoursOnHolidays
  });
  await integration.afterRun({ from, to, balance });
}

run();
