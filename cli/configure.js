import fs from 'fs';
import { BOUNTY_CONFIG_DIR, BOUNTY_CORE_CONFIG_FILE } from '../core/constants.js';
import { CONFIG_FILE as HARVEST_CONFIG_FILE } from '../integrations/harvest/constants.js';
import inquirer from 'inquirer';
import { NorwegianHoliday } from '../core/holidays.js';
import { ISODateToDate, isoDateRegex } from '../core/dates.js';
import * as yup from 'yup';

/**
 * Core Bounty config file that is unprocessed / parsed
 * @typedef {Object} RawBountyConfig
 * @property {string} version
 * @property {'harvest' | 'clockify'} integration
 * @property {number} hoursOnWorkdays - Expected registered hours on workdays
 * @property {number} hoursOnHolidays - Expected registered hours on holidays
 * @property {string} referenceDate - Date in ISO format (YYYY-MM-DD), this is a date where you know what your flex balance was
 * @property {number} referenceBalance - Your flex balance at the reference date
 * @property {Record<string, number>} hoursOnSpecificHolidays - Map that maps a string to a number, where the string is the name of a holiday and the number is the expected registered hours
 */

/**
 * Core Bounty config file
 * @typedef {Object} BountyConfig
 * @property {string} version
 * @property {'harvest' | 'clockify'} integration
 * @property {number} hoursOnWorkdays - Expected registered hours on workdays
 * @property {number} hoursOnHolidays - Expected registered hours on holidays
 * @property {Date} referenceDate - this is a date where you know what your flex balance was
 * @property {number} referenceBalance - Your flex balance at the reference date
 * @property {Record<string, number>} hoursOnSpecificHolidays - Map that maps a string to a number, where the string is the name of a holiday and the number is the expected registered hours
 */

/**
 * The old harvest config format at the of refactoring config files into core bounty config and integration configs
 *
 * @typedef {Object} OldHarvestConfig
 * @property {string} version - The version of the data.
 * @property {Object} headers - The headers for the request.
 * @property {string} headers.Harvest-Account-ID - The Harvest Account ID.
 * @property {string} headers.Authorization - The Authorization token.
 * @property {string} referenceDate - The reference date in YYYY-MM-DD format.
 * @property {number} referenceBalance - The reference balance.
 * @property {Array.<Object>} entriesToIgnore - An array of entries to ignore.
 * @property {string} entriesToIgnore[].project - The project name of the entry to ignore.
 * @property {string} entriesToIgnore[].task - The task name of the entry to ignore.
 * @property {number} expectedRegisteredHoursOnWorkdays - The expected registered hours on workdays.
 * @property {number} expectedRegisteredHoursOnHolidays - The expected registered hours on holidays.
 */

const configSchema = yup.object().shape({
  version: yup.string().required(),
  integration: yup.string().oneOf(['harvest', 'clockify']).required(),
  hoursOnWorkdays: yup.number().required(),
  hoursOnHolidays: yup.number().required(),
  referenceDate: yup.string().required(),
  referenceBalance: yup.number().required(),
  hoursOnSpecificHolidays: yup
    .object()
    .nullable()
    .test(
      'valid-holidays',
      'Config object has invalid holiday in hoursOnSpecificHolidays, see docs for valid holidays',
      (value) => {
        if (!value) {
          return true;
        }
        const validHolidays = Object.values(NorwegianHoliday);
        return Object.keys(value).every((holiday) => validHolidays.includes(holiday));
      }
    )
    .test(
      'valid-hours',
      'Config object has non-numeric value for holiday in hoursOnSpecificHolidays, should be a number',
      (value) => {
        if (!value) {
          return true;
        }
        return Object.values(value).every((hours) => !isNaN(parseFloat(hours)));
      }
    ),
});

/**
 * @param {RawBountyConfig} config
 * @returns {BountyConfig}
 */
export function validateAndProcessBountyConfig(config) {
  try {
    const validatedConfig = { ...configSchema.validateSync(config, { strict: true }) };
    validatedConfig.referenceDate = ISODateToDate(config.referenceDate);
    return validatedConfig;
  } catch (error) {
    console.error(
      `\x1b[31mError while processing config file \x1b[33m${BOUNTY_CORE_CONFIG_FILE}\x1b[m:\n${error}`
    );
    process.exit(1);
  }
}

/**
 * Returns null if the config file does not exist
 * @param
 * @returns {RawBountyConfig | null} Bounty configuration
 */
export function getConfig() {
  if (!fs.existsSync(BOUNTY_CORE_CONFIG_FILE)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(BOUNTY_CORE_CONFIG_FILE).toString());
}

/**
 * @param {string} input
 */
function validateNumber(input) {
  if (isNaN(parseFloat(input))) {
    return 'Must be valid number';
  }
  return true;
}

/**
 * At the beginning there was only the harvest integration. It had it's config in ~/.bounty/config.json,
 * but now ~/.bounty/config.json is meant to be used by bounty "core", while the harvest config should
 * be in ~/.bounty/harvest.json. This function will both handle creating a new config in the case of
 * a clean install of bounty, but it will also deal with moving a Harvest config to its new location
 * and then creating a new core config etc.
 *
 * @returns {Promise<BountyConfig>}
 */
export async function initalizeBountyConfig() {
  let config = getConfig();
  let isOldHarvestConfig = config != null && !config.integration;

  /** @type {OldHarvestConfig | null} */
  let oldHarvestConfig = null;

  if (config != null && !isOldHarvestConfig) {
    return validateAndProcessBountyConfig(config);
  }

  if (isOldHarvestConfig) {
    console.log(
      `Detected old harvest config file at ${BOUNTY_CORE_CONFIG_FILE}, moving it to the new location: ${HARVEST_CONFIG_FILE}`
    );
    fs.copyFileSync(BOUNTY_CORE_CONFIG_FILE, HARVEST_CONFIG_FILE);
    oldHarvestConfig = config;
  }

  fs.mkdirSync(BOUNTY_CONFIG_DIR, { recursive: true });
  config = {};

  const { integration } = await inquirer.prompt({
    type: 'list',
    name: 'integration',
    message: 'Select the time registration system that you use:',
    choices: [
      { name: 'Harvest', value: 'harvest' },
      { name: 'Clockify', value: 'clockify' },
    ],
  });

  config.version = '1';
  config.integration = integration;

  // The reason for checking if the config values already exists is because one may already have it from an old harvest config
  if (!oldHarvestConfig?.referenceDate) {
    const { referenceDate } = await inquirer.prompt({
      type: 'input',
      name: 'referenceDate',
      message: 'Enter reference date (YYYY-MM-DD):',
      validate(input) {
        if (!isoDateRegex.test(input)) {
          return 'Invalid date format. Please enter a date in the format YYYY-MM-DD.';
        }
        return true;
      },
    });

    config.referenceDate = referenceDate;
  } else {
    console.log('Found reference date from old config, will use that:', oldHarvestConfig.referenceDate);
    config.referenceDate = oldHarvestConfig.referenceDate;
  }

  if (!oldHarvestConfig?.referenceBalance) {
    const { referenceBalance } = await inquirer.prompt({
      type: 'input',
      name: 'referenceBalance',
      message: 'Enter reference flextime balance (float):',
      validate: validateNumber,
    });

    config.referenceBalance = parseFloat(referenceBalance);
  } else {
    console.log(
      'Found reference flextime balance from old config, will use that:',
      oldHarvestConfig.referenceBalance
    );
    config.referenceBalance = oldHarvestConfig.referenceBalance;
  }

  if (!oldHarvestConfig?.expectedRegisteredHoursOnWorkdays) {
    const defaultHoursOnWorkdays = 7.5;
    const { hoursOnWorkdays } = await inquirer.prompt({
      type: 'input',
      name: 'hoursOnWorkdays',
      message: `Enter expected registered hours per day (float, default ${defaultHoursOnWorkdays}):`,
      default: defaultHoursOnWorkdays,
      validate: validateNumber,
    });

    config.hoursOnWorkdays = parseFloat(hoursOnWorkdays);
  } else {
    console.log(
      'Found expected registered hours per day from old config, will use that:',
      oldHarvestConfig.expectedRegisteredHoursOnWorkdays
    );
    config.hoursOnWorkdays = oldHarvestConfig.expectedRegisteredHoursOnWorkdays;
  }

  if (!oldHarvestConfig?.expectedRegisteredHoursOnHolidays) {
    const defaultHoursOnHolidays = 7.5;
    const { hoursOnHolidays } = await inquirer.prompt({
      type: 'input',
      name: 'hoursOnHolidays',
      message: `Enter expected registered hours on holidays (float, default ${defaultHoursOnHolidays}):`,
      default: defaultHoursOnHolidays,
      validate: validateNumber,
    });

    config.hoursOnHolidays = parseFloat(hoursOnHolidays);
  } else {
    console.log(
      'Found expected registered hours on holidays from old config, will use that:',
      oldHarvestConfig.expectedRegisteredHoursOnHolidays
    );
    config.hoursOnHolidays = oldHarvestConfig.expectedRegisteredHoursOnHolidays;
  }

  const defaultHoursOnHolyWednesday = 3.75;
  const { hoursOnHolyWednesday } = await inquirer.prompt({
    type: 'input',
    name: 'hoursOnHolyWednesday',
    message: `Enter expected registered hours on Holy Wednesday (onsdagen før Skjærtorsdag) (float, default ${defaultHoursOnHolyWednesday}):`,
    default: defaultHoursOnHolyWednesday,
    validate: validateNumber,
  });

  const defaultHoursOnChristmasEve = 3.75;
  const { hoursOnChristmasEve } = await inquirer.prompt({
    type: 'input',
    name: 'hoursOnChristmasEve',
    message: `Enter expected registered hours on Christmas Eve (Julaften, 24. December) (float, default ${defaultHoursOnChristmasEve}):`,
    default: defaultHoursOnChristmasEve,
    validate: validateNumber,
  });

  config.hoursOnSpecificHolidays = {
    [NorwegianHoliday.HOLY_WEDNESDAY]: parseFloat(hoursOnHolyWednesday),
    [NorwegianHoliday.CHRISTMAS_EVE]: parseFloat(hoursOnChristmasEve),
  };

  const validatedconfig = validateAndProcessBountyConfig(config);
  fs.writeFileSync(BOUNTY_CORE_CONFIG_FILE, JSON.stringify(config, null, 2));
  return validatedconfig;
}
