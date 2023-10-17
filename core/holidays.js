import { DAY_TO_NUM, validateFromToDates, offsetDate, isBetween } from './dates.js';

/**
 * @enum {string}
 * @readonly
 */
export const NorwegianHoliday = {
  PALM_SUNDAY: 'palmSunday',
  HOLY_WEDNESDAY: 'holyWednesday',
  MAUNDY_THURSDAY: 'maundyThursday',
  GOOD_FRIDAY: 'goodFriday',
  EASTER_SUNDAY: 'easterSunday',
  EASTER_MONDAY: 'easterMonday',
  ASCENSION_DAY: 'ascensionDay',
  WHITSUN: 'whitsun',
  WHIT_MONDAY: 'whitMonday',
  NEW_YEAR: 'newYear',
  WORKERS_DAY: 'workersDay',
  INDEPENDENCE_DAY: 'independenceDay',
  CHRISTMAS_EVE: 'christmasEve',
  CHRISTMAS_DAY: 'christmasDay',
  BOXING_DAY: 'boxingDay',
  NEW_YEARS_EVE: 'newYearsEve',
};

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
 * Returns easter days respective to given year
 * @param {number} year must be greater or equal to 1970
 * @returns {Record<NorwegianHoliday, Date>} An object with the Norwegian holidays for the given year.
 */
export function calcEasterDates(year) {
  const easterSunday = calcEasterSunday(year);
  return {
    [NorwegianHoliday.PALM_SUNDAY]: offsetDate(easterSunday, { days: -7 }),
    [NorwegianHoliday.HOLY_WEDNESDAY]: offsetDate(easterSunday, { days: -4 }),
    [NorwegianHoliday.MAUNDY_THURSDAY]: offsetDate(easterSunday, { days: -3 }),
    [NorwegianHoliday.GOOD_FRIDAY]: offsetDate(easterSunday, { days: -2 }),
    [NorwegianHoliday.EASTER_SUNDAY]: easterSunday,
    [NorwegianHoliday.EASTER_MONDAY]: offsetDate(easterSunday, { days: 1 }),
    [NorwegianHoliday.ASCENSION_DAY]: offsetDate(easterSunday, { days: 39 }),
    [NorwegianHoliday.WHITSUN]: offsetDate(easterSunday, { days: 49 }),
    [NorwegianHoliday.WHIT_MONDAY]: offsetDate(easterSunday, { days: 50 }),
  };
}

/**
 * @param {number} year
 * @returns {Record<NorwegianHoliday, Date>} An object with the Norwegian holidays for the given year.
 */
export function getNorwegianHolidays(year) {
  const easterDates = calcEasterDates(year);
  const fixedHolidays = {
    [NorwegianHoliday.NEW_YEAR]: new Date(year, 0, 1),
    [NorwegianHoliday.WORKERS_DAY]: new Date(year, 4, 1),
    [NorwegianHoliday.INDEPENDENCE_DAY]: new Date(year, 4, 17),
    [NorwegianHoliday.CHRISTMAS_EVE]: new Date(year, 11, 24),
    [NorwegianHoliday.CHRISTMAS_DAY]: new Date(year, 11, 25),
    [NorwegianHoliday.BOXING_DAY]: new Date(year, 11, 26),
    [NorwegianHoliday.NEW_YEARS_EVE]: new Date(year, 11, 31),
  };
  return { ...easterDates, ...fixedHolidays };
}

/**
 * Generator returning norwegian holidays between 'from' and 'to' dates
 * @param {Date} from
 * @param {Date} to
 * @returns {Generator<{name: string, date: Date}>, void, void>}
 */
export function* norwegianHolidaysGenerator(from, to) {
  validateFromToDates(from, to);
  const fromYear = from.getFullYear();
  for (const i of Array(to.getFullYear() - fromYear + 1).keys()) {
    for (const [name, date] of Object.entries(getNorwegianHolidays(i + fromYear))) {
      if (isBetween(date, from, to)) {
        yield { name, date };
      } else {
        continue;
      }
    }
  }
}

/**
 * @param {Iterable<{name: NorwegianHoliday, date: Date}>} holidays
 * @param {Day[]} days
 * @returns {{
 *  days: number
 *  [holidayName: string]: number
 * }}
 */
export function groupHolidaysByDays(holidays, days) {
  const workdaySet = new Set(days.map((day) => DAY_TO_NUM[day]));
  let holidaysInDays = 0;
  const holidayNameCount = {};
  for (const { name, date } of holidays) {
    if (workdaySet.has(date.getDay())) {
      holidaysInDays += 1;
      holidayNameCount[name] = (holidayNameCount[name] ?? 0) + 1;
    }
  }
  return {
    days: holidaysInDays,
    ...holidayNameCount,
  };
}
