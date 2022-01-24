// These day constants can be any value as long as they can be used as object keys
const MONDAY = 'monday'
const TUESDAY = 'tuesday'
const WEDNESDAY = 'wednesday'
const THURSDAY = 'thursday'
const FRIDAY = 'friday'
const SATURDAY = 'saturday'
const SUNDAY = 'sunday'

/**
 * Maps the day constants to Date.prototype.getDate() values
 */
const DAY_TO_NUM = {
  [MONDAY]: 1,
  [TUESDAY]: 2,
  [WEDNESDAY]: 3,
  [THURSDAY]: 4,
  [FRIDAY]: 5,
  [SATURDAY]: 6,
  [SUNDAY]: 0
}

/**
 * Maps the Date.prototype.getDate() values to the day constants
 */
const NUM_TO_DAY = {
  1: MONDAY,
  2: TUESDAY,
  3: WEDNESDAY,
  4: THURSDAY,
  5: FRIDAY,
  6: SATURDAY,
  0: SUNDAY
}

const UNIQUE_DAYS = [
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  SUNDAY
]

const DEFAULT_WORKDAYS = [
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY
]

/**
 * Based on Python's dateutil easter implementation
 * @param {number} year
 * @returns date of easter sunday at given year
 */
function calcEasterSunday(year) {
  if (typeof year !== 'number') {
    throw new Error('Year must specified as a number')
  }

  const y = year
  const g = y % 19
  const c = Math.floor(y / 100)
  const h = (c - Math.floor(c / 4) - Math.floor((8 * c + 13) / 25) + 19 * g + 15) % 30
  const i = h - Math.floor(h / 28) * (1 - Math.floor(h / 28) * Math.floor(29 / (h + 1)) * Math.floor((21 - g) / 11))
  const j = (y + Math.floor(y / 4) + i + 2 - c + Math.floor(c / 4)) % 7
  const p = i - j
  const d = 1 + (p + 27 + Math.floor((p + 6) / 40)) % 31
  const m = 3 + Math.floor((p + 26) / 30)
  return new Date(y, m - 1, d)
}

/**
 * Offset given date
 * @param {Date} date
 * @param offsets
 * @returns new date with offsets
 */
function offsetDate(
  date,
  { years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0, milliseconds = 0 } = {}
) {
  return new Date(
    date.getFullYear() + years,
    date.getMonth() + months,
    date.getDate() + days,
    date.getHours() + hours,
    date.getMinutes() + minutes,
    date.getSeconds() + seconds,
    date.getMilliseconds() + milliseconds
  );
}

/**
 * Returns easter days respective to given year
 * @param {number} year must be greater or equal to 1970
 * @returns
 */
function calcEasterDates(year) {
  const easterSunday = calcEasterSunday(year)
  return {
    palmSunday: offsetDate(easterSunday, { days: -7 }),
    maundyThursday: offsetDate(easterSunday, { days: -3 }),
    goodFriday: offsetDate(easterSunday, { days: -2 }),
    easterSunday,
    easterMonday: offsetDate(easterSunday, { days: 1 }),
    ascensionDay: offsetDate(easterSunday, { days: 39 }),
    whitsun: offsetDate(easterSunday, { days: 49 }),
    whitMonday: offsetDate(easterSunday, { days: 50 })
  }
}

/**
 * @param {number} year
 * @returns
 */
function getNorwegianHolidays(year) {
  const easterDates = calcEasterDates(year)
  const fixedHolidays = {
    newYear: new Date(year, 0, 1),
    workersDay: new Date(year, 4, 1),
    independenceDay: new Date(year, 4, 17),
    christmasEve: new Date(year, 11, 24), // Not necessarily for all workplaces
    christmasDay: new Date(year, 11, 25), // Forste juledag
    boxingDay: new Date(year, 11, 26), // Andre jule dag
  }
  return { ...easterDates, ...fixedHolidays }
}

/**
 * @param {Date} date
 * @returns
 */
function inWeekend(date) {
  return !(date.getDay() % 6)
}


/**
 * Assert that from is before to, else throw error
 * @param {Date} from
 * @param {Date} to
 * @param alternativeNames in case you want to change the 'from' and 'to' names in the error message
 * @returns
 */
function validateFromToDates(from, to, { fromAlias = 'from', toAlias = 'to' } = {}) {
  if (from.getTime() > to.getTime())
    throw new Error(`"${fromAlias}" date cannot be later than "${toAlias}" date`)
}

/**
 * Inclusive 'from' and 'to' dates
 * @param {Date} date
 * @param {Date} from
 * @param {Date} to
 * @returns
 */
function isBetween(date, from, to) {
  validateFromToDates(from, to)
  return (from.getTime() <= date.getTime()) && (date.getTime() <= to.getTime())
}

/**
 * Calculate number of days and number of saturdays and sundays between 'from' and 'to' dates.
 * Returned days are total days, so you must subtract saturdaysAndSundays to get work days
 * @param {Date} from
 * @param {Date} to
 * @returns
 */
function countDays(from, to) {
  validateFromToDates(from, to)
  const days = 1 + Math.round((to.getTime() - from.getTime()) / 86400000)
  const fromDay = from.getDay()
  return {
    days,
    [MONDAY]: Math.floor((days + (fromDay + 5) % 7) / 7),
    [TUESDAY]: Math.floor((days + (fromDay + 4) % 7) / 7),
    [WEDNESDAY]: Math.floor((days + (fromDay + 3) % 7) / 7),
    [THURSDAY]: Math.floor((days + (fromDay + 2) % 7) / 7),
    [FRIDAY]: Math.floor((days + (fromDay + 1) % 7) / 7),
    [SATURDAY]: Math.floor((days + fromDay) / 7),
    [SUNDAY]: Math.floor((days + (fromDay + 6) % 7) / 7)
  }
}

/**
 * Loop based version of countDays. Used for validation in tests.
 * @param {Date} from
 * @param {Date} to
 * @returns
 */
function slowCountDays(from, to) {
  validateFromToDates(from, to)
  const counts = {
    days: 0,
    [MONDAY]: 0,
    [TUESDAY]: 0,
    [WEDNESDAY]: 0,
    [THURSDAY]: 0,
    [FRIDAY]: 0,
    [SATURDAY]: 0,
    [SUNDAY]: 0
  }

  let curr = offsetDate(from) // do a copy
  while (curr.getTime() <= to.getTime()) {
    counts[NUM_TO_DAY[curr.getDay()]] += 1
    curr = offsetDate(curr, { days: 1 })
    counts.days++
  }
  return counts
}

/**
 * Aggregates array of objects.
 * @param {Array<object>} objects, array of objects with identical properties
 * @param {Function} aggregator, function to aggregate values
 * @returns {object}
 */
function aggregate(objects, aggregator = (x, y) => x + y) {
  const keys = Reflect.ownKeys(objects[0])
  return objects.slice(1).reduce((acc, object) =>
    keys.forEach(key => { acc[key] = aggregator(acc[key], object[key]) }) || acc
    , { ...objects[0] })
}

/**
 * Generator returning norwegian holidays between 'from' and 'to' dates
 * @param {Date} from
 * @param {Date} to
 * @returns {Generator<Date, void, void>}
 */
function* norwegianHolidaysGenerator(from, to) {
  validateFromToDates(from, to)
  const fromYear = from.getFullYear()
  for (let i of Array(to.getFullYear() - fromYear + 1).keys())
    for (let date of Object.values(getNorwegianHolidays(i + fromYear)))
      if (isBetween(date, from, to))
        yield date
      else
        continue
}

/**
 * E.g. given monday to friday, return ['saturday', 'sunday']
 * @param {Array<Date>} days
 * @returns
 */
function getComplementWeekdays(days) {
  days = new Set(days)
  return UNIQUE_DAYS.filter(day => !days.has(day))
}

/**
 * @param {Iterable<Date>} holidays
 * @param {Array<string>} workdays
 * @returns
 */
function countHolidaysInWorkdays(holidays, workdays) {
  const workdaySet = new Set(workdays)
  let holidaysInWorkdays = 0
  for (let holiday of holidays)
    if (workdaySet.has(holiday.getDay()))
      holidaysInWorkdays++
  return holidaysInWorkdays
}

/**
 * Get today's date object with zeroed out hours, minutes, seconds and milliseconds
 * @returns
 */
function getToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

/**
 * @param {number} actualHours
 * @param {Date} referenceDate
 * @param {number} referenceBalance
 * @param {{
 *  to: Date,
 *  workdays: Array<string>,
 *  holidays: Iterable<Date>,
 *  workHoursPerDay: number
 * }} optionals
 * @returns flex balance
 */
function calcFlexBalance(
  actualHours,
  referenceDate,
  referenceBalance,
  {
    to = getToday(),
    workdays = DEFAULT_WORKDAYS,
    holidays = norwegianHolidaysGenerator(referenceDate, to),
    workHoursPerDay = 7.5
  } = {}
) {
  validateFromToDates(referenceDate, to, { fromAlias: 'referenceDate' })
  const { days: dayCount, ...weekdaysCounts } = countDays(referenceDate, to)
  const holidaysInWorkdays = countHolidaysInWorkdays(holidays, workdays)
  const offdaysCount = getComplementWeekdays(workdays).reduce((acc, day) => acc + weekdaysCounts[day], 0)
  const expectedHours = (dayCount - holidaysInWorkdays - offdaysCount) * workHoursPerDay
  return actualHours - expectedHours + referenceBalance
}

export default {
  aggregate,
  calcEasterDates,
  calcEasterSunday,
  calcFlexBalance,
  countDays,
  DAY_TO_NUM,
  DEFAULT_WORKDAYS,
  FRIDAY,
  getComplementWeekdays,
  getNorwegianHolidays,
  getToday,
  inWeekend,
  isBetween,
  MONDAY,
  norwegianHolidaysGenerator,
  NUM_TO_DAY,
  offsetDate,
  SATURDAY,
  slowCountDays,
  SUNDAY,
  THURSDAY,
  TUESDAY,
  WEDNESDAY,
  UNIQUE_DAYS
}

if (typeof require !== 'undefined' && require.main === module) {
  countDaysDraw = (from, to) => ({
    1: '#'.repeat((from.getDay() + 5) % 7),
    2: '#'.repeat((from.getDay() + 4) % 7),
    3: '#'.repeat((from.getDay() + 3) % 7),
    4: '#'.repeat((from.getDay() + 2) % 7),
    5: '#'.repeat((from.getDay() + 1) % 7),
    6: '#'.repeat((from.getDay() + 0) % 7),
    0: '#'.repeat((from.getDay() + 6) % 7)
  })

  const from = new Date(2022, 0, 2)
  const to = offsetDate(from, { days: 7 })
  console.log(countDaysDraw(from, to))
}