/**
 * Contains an array of migration functions
 *
 * A migration function is used to migrate the config file into newer versions.
 * The functions should be executed sequentially, and they should take the configuration object
 * returned from the previous function and return an object themselves.
 *
 * If a migration functions detects that there is no need for it to migrate it should
 * return the SAME object (same memory), else it should return a NEW object
 *
 * All functions should assume that the config files has never been
 * incorrectly altered, and that the previous function has successfully ran.
 */

import inquirer from 'inquirer';

export default [
  /**
   * Initial migration (should be ran on first bounty harvest run)
   */
  async function initBountyConfig(config) {
    const objectIsEmpty = (object) => Object.keys(object).length === 0;

    if (
      !objectIsEmpty(config) &&
      config.headers['Harvest-Account-ID'] !== null &&
      config.headers['Authorization'] !== null
    ) {
      return config;
    }
    console.log('Go to \x1b[33mhttps://id.getharvest.com/developers\x1b[m');
    console.log('Press "Create new personal access token" if you dont have one');
    const { token } = await inquirer.prompt({
      type: 'input',
      name: 'token',
      message: 'Copy and paste your account token here:',
    });

    const { accountId } = await inquirer.prompt({
      type: 'input',
      name: 'accountId',
      message: 'Copy and paste your Account ID here:',
    });

    console.log('Got token:', token);
    console.log('Got Account Id:', accountId);
    return {
      version: '1',
      headers: {
        'Harvest-Account-ID': accountId,
        Authorization: 'Bearer ' + token,
      },
      entriesToIgnore: [],
    };
  },

  /**
   * This migration is now partly deprecated as most of what it did before
   * is now unused
   *
   * Old migration logic:
   * Add version, expectedWorkHoursPerDay and entriesToIgnore
   * @param {object} config
   */
  async function migrate2(config) {
    if (parseInt(config.version) >= 2) {
      return config;
    }

    return {
      version: '2',
      ...config,
      entriesToIgnore: [{ project: 'Absence', task: 'Time off' }],
    };
  },

  /**
   * This migration is now deprecated as what it did before is now unused
   *
   * Old migration logic:
   * Rename expectedWorkHoursPerDay to expectedRegisteredHoursOnWorkdays
   * Add expectedRegisteredHoursOnHolidays
   * @param {object} config
   */
  async function migrate3(config) {
    if (parseInt(config.version) >= 3) {
      return config;
    }

    return { version: '3', ...config };
  },

  /**
   * Migration function that is used for clearing up after refactoring
   * referenceBalance, referenceDate, expectedRegisteredHoursOnWorkdays and
   * expectedRegisteredHoursOnHolidays to core bounty config
   * @param {object} config
   */
  async function migrate4(config) {
    if (parseInt(config.version) >= 4) {
      return config;
    }

    return {
      version: '4',
      headers: config.headers,
      entriesToIgnore: config.entriesToIgnore,
    };
  },
];
