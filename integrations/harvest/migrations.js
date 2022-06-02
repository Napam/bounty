/**
 * Contains an array if migration functions
 * 
 * A migration function is used to migrate the config file into newer versions.
 * The functions should be executed sequentially, and they should take the configuration object
 * returned from the previous function and return an object themselves.
 * 
 * All functions should assume that the config files has never been
 * incorrectly altered, and that the previous function has successfully ran.
 */
export default [
  /**
   * Initial "migration"
   */
  async function initBountyConfig(config) {
    const objectIsEmpty = object => Object.keys(object).length === 0
    if (!objectIsEmpty(config))
      return config

    return {
      headers: {
        'Harvest-Account-ID': null,
        'Authorization': null
      },
      referenceDate: null,
      referenceBalance: null,
    }
  },
  /**
   * Add version, expectedWorkHoursPerDay and entriesToIgnore
   * @param {object} config 
   */
  async function migrate2(config) {
    if (config.version === '2')
      return config

    return {
      version: '2',
      headers: {
        'Harvest-Account-ID': config.headers['Harvest-Account-ID'],
        'Authorization': config.headers['Authorization']
      },
      referenceDate: config.referenceDate,
      referenceBalance: config.referenceBalance,
      expectedWorkHoursPerDay: 7.5,
      entriesToIgnore: [
        { project: 'Absence', task: 'Time off' }
      ]
    }
  }
]
