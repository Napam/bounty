/**
 * @typedef {'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' } Day
 **/

/** @type {Day} */
export const MONDAY = 'monday';

/** @type {Day} */
export const TUESDAY = 'tuesday';

/** @type {Day} */
export const WEDNESDAY = 'wednesday';

/** @type {Day} */
export const THURSDAY = 'thursday';

/** @type {Day} */
export const FRIDAY = 'friday';

/** @type {Day} */
export const SATURDAY = 'saturday';

/** @type {Day} */
export const SUNDAY = 'sunday';

/**
 * Maps the Day enum to Date.prototype.getDate() values
 *
 * @type {Map<Day, number>}
 */
export const DAY_TO_NUM = {
  [MONDAY]: 1,
  [TUESDAY]: 2,
  [WEDNESDAY]: 3,
  [THURSDAY]: 4,
  [FRIDAY]: 5,
  [SATURDAY]: 6,
  [SUNDAY]: 0,
};

/**
 * Maps the Date.prototype.getDate() values to the day constants
 *
 * @type {Map<number, Day>}
 */
export const NUM_TO_DAY = {
  1: MONDAY,
  2: TUESDAY,
  3: WEDNESDAY,
  4: THURSDAY,
  5: FRIDAY,
  6: SATURDAY,
  0: SUNDAY,
};

/** @type {Day[]} */
export const UNIQUE_DAYS = [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY];

/** @type {Day[]} */
export const DEFAULT_WORKDAYS = [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY];

/**
 * Based on Python's dateutil easter implementation
 * @param {number} year
 * @returns date of easter sunday at given year
 */
export function calcEasterSunday(year) {
  if (typeof year !== 'number') throw new Error('Year must specified as a number');

  const y = year;
  const g = y % 19;
  const c = Math.floor(y / 100);
  const h = (c - Math.floor(c / 4) - Math.floor((8 * c + 13) / 25) + 19 * g + 15) % 30;
  const i =
    h - Math.floor(h / 28) * (1 - Math.floor(h / 28) * Math.floor(29 / (h + 1)) * Math.floor((21 - g) / 11));
  const j = (y + Math.floor(y / 4) + i + 2 - c + Math.floor(c / 4)) % 7;
  const p = i - j;
  const d = 1 + ((p + 27 + Math.floor((p + 6) / 40)) % 31);
  const m = 3 + Math.floor((p + 26) / 30);
  return new Date(y, m - 1, d);
}

/**
 * Offset given date
 * @param {Date} date
 * @param offsets
 * @returns new date with offsets
 */
export function offsetDate(
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
 * @param {string} isodate, date formatted as YYYY-MM-DD
 * @param offsets
 * @returns string with format YYYY-MM-DD
 */
export function offsetISODate(isodate, { years = 0, months = 0, days = 0 } = {}) {
  return offsetDate(new Date(isodate.split('T')[0]), { years, months, days })
    .toISOString()
    .split('T')[0];
}

/**
 * Returns easter days respective to given year
 * @param {number} year must be greater or equal to 1970
 * @returns
 */
export function calcEasterDates(year) {
  const easterSunday = calcEasterSunday(year);
  return {
    palmSunday: offsetDate(easterSunday, { days: -7 }),
    maundyThursday: offsetDate(easterSunday, { days: -3 }),
    goodFriday: offsetDate(easterSunday, { days: -2 }),
    easterSunday,
    easterMonday: offsetDate(easterSunday, { days: 1 }),
    ascensionDay: offsetDate(easterSunday, { days: 39 }),
    whitsun: offsetDate(easterSunday, { days: 49 }),
    whitMonday: offsetDate(easterSunday, { days: 50 }),
  };
}

/**
 * @param {number} year
 * @returns
 */
export function getNorwegianHolidays(year) {
  const easterDates = calcEasterDates(year);
  const fixedHolidays = {
    newYear: new Date(year, 0, 1),
    workersDay: new Date(year, 4, 1),
    independenceDay: new Date(year, 4, 17),
    christmasEve: new Date(year, 11, 24), // Julaften, not necessarily for all workplaces
    christmasDay: new Date(year, 11, 25), // Forste juledag
    boxingDay: new Date(year, 11, 26), // Andre jule dag
    newYearsEve: new Date(year, 11, 31), // New year, not necessarily for all workplaces
  };
  return { ...easterDates, ...fixedHolidays };
}

/**
 * @param {Date} date
 * @returns
 */
export function inWeekend(date) {
  return !(date.getDay() % 6);
}

/**
 * Assert that 'from' is before 'to', else throw error
 * @param {Date} from
 * @param {Date} to
 * @param alternativeNames in case you want to change the 'from' and 'to' names in the error message
 * @returns
 */
export function validateFromToDates(from, to, { fromAlias = 'from', toAlias = 'to' } = {}) {
  if (from.getTime() > to.getTime())
    throw new Error(`"${fromAlias}" date cannot be later than "${toAlias}" date`);
}

/**
 * Inclusive 'from' and 'to' dates
 * @param {Date} date
 * @param {Date} from
 * @param {Date} to
 * @returns
 */
export function isBetween(date, from, to) {
  validateFromToDates(from, to);
  return from.getTime() <= date.getTime() && date.getTime() <= to.getTime();
}

/**
 * Calculate number of days between and including 'from' and 'to' dates.
 * @param {Date} from
 * @param {Date} to
 * @returns total number of days, and the count of each distinct days
 */
export function countDays(from, to) {
  validateFromToDates(from, to);
  const days = 1 + Math.round((to.getTime() - from.getTime()) / 86400000);
  const fromDay = from.getDay();
  return {
    days,
    [MONDAY]: Math.floor((days + ((fromDay + 5) % 7)) / 7),
    [TUESDAY]: Math.floor((days + ((fromDay + 4) % 7)) / 7),
    [WEDNESDAY]: Math.floor((days + ((fromDay + 3) % 7)) / 7),
    [THURSDAY]: Math.floor((days + ((fromDay + 2) % 7)) / 7),
    [FRIDAY]: Math.floor((days + ((fromDay + 1) % 7)) / 7),
    [SATURDAY]: Math.floor((days + fromDay) / 7),
    [SUNDAY]: Math.floor((days + ((fromDay + 6) % 7)) / 7),
  };
}

/**
 * Loop based version of countDays. Used for validation in tests.
 * @param {Date} from
 * @param {Date} to
 * @returns
 */
export function slowCountDays(from, to) {
  validateFromToDates(from, to);
  const counts = {
    days: 0,
    [MONDAY]: 0,
    [TUESDAY]: 0,
    [WEDNESDAY]: 0,
    [THURSDAY]: 0,
    [FRIDAY]: 0,
    [SATURDAY]: 0,
    [SUNDAY]: 0,
  };

  let curr = offsetDate(from); // do a copy
  while (curr.getTime() <= to.getTime()) {
    counts[NUM_TO_DAY[curr.getDay()]] += 1;
    curr = offsetDate(curr, { days: 1 });
    counts.days++;
  }
  return counts;
}

/**
 * Aggregates array of objects.
 * @param {Array<object>} objects - array of objects with identical properties
 * @param {Function} aggregator - function to aggregate values
 * @returns {object}
 */
export function aggregate(objects, aggregator = (x, y) => x + y) {
  const keys = Reflect.ownKeys(objects[0]);
  return objects.slice(1).reduce(
    (acc, object) =>
      keys.forEach((key) => {
        acc[key] = aggregator(acc[key], object[key]);
      }) || acc,
    { ...objects[0] }
  );
}

/**
 * Generator returning norwegian holidays between 'from' and 'to' dates
 * @param {Date} from
 * @param {Date} to
 * @returns {Generator<Date, void, void>}
 */
export function* norwegianHolidaysGenerator(from, to) {
  validateFromToDates(from, to);
  const fromYear = from.getFullYear();
  for (let i of Array(to.getFullYear() - fromYear + 1).keys())
    for (let date of Object.values(getNorwegianHolidays(i + fromYear)))
      if (isBetween(date, from, to)) yield date;
      else continue;
}

/**
 * E.g. given monday to friday, return ['saturday', 'sunday']
 * @param {Day[]} days
 * @returns
 */
export function getComplementWeekdays(days) {
  days = new Set(days);
  return UNIQUE_DAYS.filter((day) => !days.has(day));
}

/**
 * @param {Iterable<Date>} dates
 * @param {Day[]} days
 * @returns
 */
export function countDatesOfDays(dates, days) {
  const workdaySet = new Set(days.map((day) => DAY_TO_NUM[day]));
  let datesInDays = 0;
  for (let date of dates) {
    datesInDays += workdaySet.has(date.getDay());
  }
  return datesInDays;
}

/**
 * Get today's date object with zeroed out hours, minutes, seconds and milliseconds
 * @returns
 */
export function getTodayDate() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get today's date iso string (YYYY-MM-DD)
 * @returns
 */
export function getTodayISO() {
  const date = new Date();
  date.setHours(0, -date.getTimezoneOffset(), 0, 0);
  return date.toISOString().split('T')[0];
}

/**
 * @param {string} isodate MMMM-YY-DD
 * @returns
 */
export function ISOToMs(isodate) {
  return new Date(isodate.split('T')[0].split('-')).getTime();
}

/**
 * Turn Javascript date into YYYY-MM-DDTHH:MM:SSZ format with "zeroed" timezone offset
 * @param {Date} date
 */
export function dateToISODatetimeWithoutOffset(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
}

/**
 * Turn Javascript date into YYYY-MM-DD, will zero out offset
 * E.g. a Date object of 2023-08-13T22:00:00.000Z will become 2023-08-14 in Norway
 * @param {Date} date
 */
export function dateToISODate(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
}

const ISODurationPattern =
  /P((?<years>\d+)Y)?((?<months>\d+)M)?((?<days>\d+)D)?T((?<hours>\d+)H)?((?<minutes>\d+)M)?((?<seconds>\d+)S)?/;

/**
 * Parses ISO duration string to its components as numerical values
 * @param {string} durationString - E.g. P3Y6M4DT12H30M5S
 * @return A date object representing the time duration .
 */
export function parseISODuration(durationString) {
  const result = ISODurationPattern.exec(durationString);
  if (result === null) throw new Error(`Invalid ISO duration string: ${durationString}`);

  const { years, months, days, hours, minutes, seconds } = result.groups;
  return {
    years: parseInt(years ?? '0'),
    months: parseInt(months ?? '0'),
    days: parseInt(days ?? '0'),
    hours: parseInt(hours ?? '0'),
    minutes: parseInt(minutes ?? '0'),
    seconds: parseInt(seconds ?? '0'),
  };
}

/**
 * Parses ISO duration string to a Date object
 * @param {string} durationString - E.g. P3Y6M4DT12H30M5S
 * @return {Date} A date object representing the time duration .
 */
export function ISODurationToDate(durationString) {
  const durationParts = parseISODuration(durationString);
  return new Date(
    durationParts.years,
    durationParts.months,
    durationParts.days,
    durationParts.hours,
    durationParts.minutes,
    durationParts.seconds
  );
}

/**
 * @param {number} actualHours
 * @param {Date} referenceDate
 * @param {number} referenceBalance
 * @param {{
 *  to: Date,
 *  workdays: Day[],
 *  holidays: Iterable<Date>,
 *  expectedRegisteredHoursOnWorkdays: number
 *  expectedRegisteredHoursOnHolidays: number
 * }} optionals
 * @returns flex balance
 */
export function calcFlexBalance(
  actualHours,
  referenceDate,
  referenceBalance,
  {
    to = getTodayDate(),
    workdays = DEFAULT_WORKDAYS,
    holidays = norwegianHolidaysGenerator(referenceDate, to),
    hoursOnWorkdays = 7.5,
    hoursOnHolidays = 7.5,
  } = {}
) {
  validateFromToDates(referenceDate, to, { fromAlias: 'referenceDate' });
  const { days: dayCount, ...weekdaysCounts } = countDays(referenceDate, to);
  const holidaysInWorkdays = countDatesOfDays(holidays, workdays);
  const offdaysCount = getComplementWeekdays(workdays).reduce((acc, day) => acc + weekdaysCounts[day], 0);
  const expectedWorkedDays = dayCount - offdaysCount - holidaysInWorkdays;
  const expectedHours = expectedWorkedDays * hoursOnWorkdays + holidaysInWorkdays * hoursOnHolidays;
  return actualHours - expectedHours + referenceBalance;
}

import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const countDaysDraw = (from, to) => ({
    1: '#'.repeat((from.getDay() + 5) % 7),
    2: '#'.repeat((from.getDay() + 4) % 7),
    3: '#'.repeat((from.getDay() + 3) % 7),
    4: '#'.repeat((from.getDay() + 2) % 7),
    5: '#'.repeat((from.getDay() + 1) % 7),
    6: '#'.repeat((from.getDay() + 0) % 7),
    0: '#'.repeat((from.getDay() + 6) % 7),
  });

  const from = new Date(2022, 0, 2);
  const to = offsetDate(from, { days: 7 });
  console.log(countDaysDraw(from, to));
}
