import { getTodayDate, validateFromToDates, countDays, getComplementWeekdays, Day } from './dates.js';
import { norwegianHolidaysGenerator, groupHolidaysByDays } from './holidays.js';

/** @type {Day[]} */
export const DEFAULT_WORKDAYS = [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY];

/**
 * @param {{[name: string]: number}} holidaysCounts
 * @param {number} hoursOnHolidays: number
 * @param {{[name: string]: number}} hoursOnSpecificHolidays
 * @param {Day[]} workdays
 */
function calcExpectedHoursFromHolidays(holidaysCounts, hoursOnHolidays, hoursOnSpecificHolidays) {
  let expectedHoursFromHolidays = 0;
  for (const [name, count] of Object.entries(holidaysCounts)) {
    if (name in hoursOnSpecificHolidays) {
      expectedHoursFromHolidays += hoursOnSpecificHolidays[name] * count;
    } else {
      expectedHoursFromHolidays += hoursOnHolidays * count;
    }
  }

  return expectedHoursFromHolidays;
}

/**
 * This function will calculate the flex balance based on the input
 * @param {number} actualHours - The actual hours one has registered between the referenceDate and to date.
 * @param {Date} referenceDate - A date one knows what ones flex balance was
 * @param {number} referenceBalance - The reference balance one had at the referenceDate
 * @param {{
 *  to: Date
 *  workdays: Day[]
 *  holidays: Iterable<{name: string, date: Date}>
 *  hoursOnWorkdays: number
 *  hoursOnHolidays: number
 *  hoursOnSpecificHolidays: {
 *    [name: string]: number
 *  }
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
    hoursOnSpecificHolidays = {},
  } = {}
) {
  validateFromToDates(referenceDate, to, { fromAlias: 'referenceDate' });
  const { days: dayCount, ...weekdaysCounts } = countDays(referenceDate, to);
  const { days: holidaysInWorkdays, ...holidaysCounts } = groupHolidaysByDays(holidays, workdays);
  const offdaysCount = getComplementWeekdays(workdays).reduce((acc, day) => acc + weekdaysCounts[day], 0);

  const expectedHoursFromHolidays = calcExpectedHoursFromHolidays(
    holidaysCounts,
    hoursOnHolidays,
    hoursOnSpecificHolidays
  );
  const expectedWorkedDays = dayCount - offdaysCount - holidaysInWorkdays;
  const expectedHours = expectedWorkedDays * hoursOnWorkdays + expectedHoursFromHolidays;
  return actualHours - expectedHours + referenceBalance;
}
