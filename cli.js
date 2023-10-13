#!/usr/bin/env node

import fs from 'fs';
import * as dateUtils from './dateUtils.js';
import { BOUNTY_CONFIG_DIR, BOUNTY_CORE_CONFIG_FILE } from './constants.js';
import { CONFIG_FILE as HARVEST_CONFIG_FILE } from './integrations/harvest/constants.js';
import inquirer from 'inquirer';

/**
 * Config file
 * @typedef {Object} BountyConfig
 * @property {string} version
 * @property {'harvest' | 'clockify'} integration
 */

/**
 * Integration module
 * @typedef {Object} Integration
 * @property {() => Promise<void> | void} beforeRun
 * @property {() => Promise<number> | number} getWorkHours
 * @property {() => Promise<number> | number} getExpectedRegisteredHoursOnWorkdays
 * @property {() => Promise<number> | number} getExpectedRegisteredHoursOnHolidays
 * @property {() => Promise<Date> | Date} getReferenceDate
 * @property {() => Promise<number> | number} getReferenceBalance
 * @property {() => Promise<void> | void} afterRun
 */

/**
 * At the beginning there was only the harvest integration. It had it's config in ~/.bounty/config.json
 * But now ~/.bounty/config.json is meant to be used by bounty "core", while the harvest config should
 * be in ~/.bounty/harvest.json (or whatever it is set to). This function will basically check if one
 * has the old harvest config file and then move it to harvest.
 *
 * It will figure it out by checking if the config is missing some of the values that bounty core must have.
 *
 * Returns true if the config had to be moved, else false
 * @param {BountyConfig} config
 * @returns {boolean}
 */
function moveOldHarvestConfigIfNeeded(config) {
  if (config.integration) {
    return false;
  }

  console.log(
    `Found old harvest config file at ${BOUNTY_CORE_CONFIG_FILE}, moving it to the new location: ${HARVEST_CONFIG_FILE}}`
  );
  fs.rename(BOUNTY_CORE_CONFIG_FILE, HARVEST_CONFIG_FILE, (error) => {
    if (error) {
      throw new Error(`Could not rename ${BOUNTY_CORE_CONFIG_FILE} to ${HARVEST_CONFIG_FILE}`);
    }
  });
  return true;
}

/**
 * @returns {Promise<BountyConfig>}
 */
async function initalizeBountyConfig() {
  if (fs.existsSync(BOUNTY_CORE_CONFIG_FILE)) {
    const config = getConfig();

    if (!moveOldHarvestConfigIfNeeded(config)) {
      return config;
    }
  }

  fs.mkdir(BOUNTY_CONFIG_DIR, { recursive: true }, (error) => {
    if (error) {
      throw new Error(`Error when attempting to create directory ${BOUNTY_CONFIG_DIR}: ${error}`);
    }
  });

  const { integration } = await inquirer.prompt({
    type: 'list',
    name: 'integration',
    message: 'Select the time registration system that you use:',
    choices: [
      { name: 'Harvest', value: 'harvest' },
      { name: 'Clockify', value: 'clockify' },
    ],
  });

  const config = { version: '1', integration };
  fs.writeFileSync(BOUNTY_CORE_CONFIG_FILE, JSON.stringify(config, null, 2));
  return config;
}

/**
 * @param
 * @returns {BountyConfig} Bounty configuration
 */
function getConfig() {
  return JSON.parse(fs.readFileSync(BOUNTY_CORE_CONFIG_FILE).toString());
}

/**
 * @param {BountyConfig} config
 * @returns {Promise<Integration>}
 */
async function getIntegration(config) {
  return await import(
    {
      harvest: './integrations/harvest/index.js',
      clockify: './integrations/clockify/index.js',
    }[config.integration]
  );
}

function incrementDateIfBeforeToday(date) {
  return dateUtils.offsetDate(date, {
    days: date.getTime() < dateUtils.getTodayDate().getTime(),
  });
}

async function run() {
  const bountyConfig = await initalizeBountyConfig();
  const {
    beforeRun,
    getWorkHours,
    getExpectedRegisteredHoursOnWorkdays,
    getExpectedRegisteredHoursOnHolidays,
    getReferenceDate,
    getReferenceBalance,
    afterRun,
  } = await getIntegration(bountyConfig);

  await beforeRun();
  const workedHours = await getWorkHours();
  const hoursOnWorkdays = await getExpectedRegisteredHoursOnWorkdays();
  const hoursOnHolidays = await getExpectedRegisteredHoursOnHolidays();
  const referenceDate = await getReferenceDate();
  const referenceBalance = await getReferenceBalance();
  const from = incrementDateIfBeforeToday(referenceDate);
  const to = dateUtils.getTodayDate();
  const balance = dateUtils.calcFlexBalance(workedHours, from, referenceBalance, {
    to,
    hoursOnWorkdays,
    hoursOnHolidays,
  });
  await afterRun({ from, to, balance });
}

run();
