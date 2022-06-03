/**
 * Contains an array if migration functions
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

import readline from 'readline'

export default [
  /**
   * Initial "migration"
   */
  async function initBountyConfig(config) {
    const objectIsEmpty = object => Object.keys(object).length === 0

    if (
      !objectIsEmpty(config) &&
      config.headers['Harvest-Account-ID'] !== null &&
      config.headers['Authorization'] !== null
    ) {
      return config
    }

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const question = string => new Promise(resolve => rl.question(string, resolve))

    console.log('Go to \x1b[33mhttps://id.getharvest.com/developers\x1b[m')
    console.log('Press "Create new personal access token" if you dont have one')
    const token = await question('Copy and paste your token here: ')
    const accountId = await question('Copy and paste Account ID here: ')
    const referenceDate = await question('Enter reference date (YYYY-MM-DD): ')
    const referenceBalance = await question('Enter reference flextime balance (float): ')
    rl.close()

    console.log('Got token:', token);
    console.log('Got Account Id:', accountId);
    return {
      headers: {
        'Harvest-Account-ID': accountId,
        'Authorization': 'Bearer ' + token
      },
      referenceDate: referenceDate,
      referenceBalance: parseFloat(referenceBalance),
    }
  },
  /**
   * Add version, expectedWorkHoursPerDay and entriesToIgnore
   * @param {object} config
   */
  async function migrate2(config) {
    if (config.version === '2') {
      return config
    }

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const question = string => new Promise(resolve => rl.question(string, resolve))
    const expectedWorkHoursPerDay = await question('Enter expected registered hours per day (float, default 7.5): ')
    rl.close()
    return {
      version: '2',
      headers: {
        'Harvest-Account-ID': config.headers['Harvest-Account-ID'],
        'Authorization': config.headers['Authorization']
      },
      referenceDate: config.referenceDate,
      referenceBalance: config.referenceBalance,
      expectedWorkHoursPerDay: expectedWorkHoursPerDay.length ? parseFloat(expectedWorkHoursPerDay) : 7.5,
      entriesToIgnore: [
        { project: 'Absence', task: 'Time off' }
      ]
    }
  }
]
