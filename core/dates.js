/**
 * @enum {string}
 * @readonly
 */
export const Day = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',
};

/**
 * Maps the Day enum to Date.prototype.getDate() values
 *
 * @type {Map<Day, number>}
 */
export const DAY_TO_NUM = {
  [Day.MONDAY]: 1,
  [Day.TUESDAY]: 2,
  [Day.WEDNESDAY]: 3,
  [Day.THURSDAY]: 4,
  [Day.FRIDAY]: 5,
  [Day.SATURDAY]: 6,
  [Day.SUNDAY]: 0,
};

/**
 * Maps the Date.prototype.getDate() values to the day constants
 *
 * @type {Map<number, Day>}
 */
export const NUM_TO_DAY = {
  1: Day.MONDAY,
  2: Day.TUESDAY,
  3: Day.WEDNESDAY,
  4: Day.THURSDAY,
  5: Day.FRIDAY,
  6: Day.SATURDAY,
  0: Day.SUNDAY,
};

/** @type {Day[]} */
export const UNIQUE_DAYS = [
  Day.MONDAY,
  Day.TUESDAY,
  Day.WEDNESDAY,
  Day.THURSDAY,
  Day.FRIDAY,
  Day.SATURDAY,
  Day.SUNDAY,
];

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
    [Day.MONDAY]: Math.floor((days + ((fromDay + 5) % 7)) / 7),
    [Day.TUESDAY]: Math.floor((days + ((fromDay + 4) % 7)) / 7),
    [Day.WEDNESDAY]: Math.floor((days + ((fromDay + 3) % 7)) / 7),
    [Day.THURSDAY]: Math.floor((days + ((fromDay + 2) % 7)) / 7),
    [Day.FRIDAY]: Math.floor((days + ((fromDay + 1) % 7)) / 7),
    [Day.SATURDAY]: Math.floor((days + fromDay) / 7),
    [Day.SUNDAY]: Math.floor((days + ((fromDay + 6) % 7)) / 7),
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
    [Day.MONDAY]: 0,
    [Day.TUESDAY]: 0,
    [Day.WEDNESDAY]: 0,
    [Day.THURSDAY]: 0,
    [Day.FRIDAY]: 0,
    [Day.SATURDAY]: 0,
    [Day.SUNDAY]: 0,
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
 * E.g. given monday to friday, return ['saturday', 'sunday']
 * @param {Day[]} days
 * @returns
 */
export function getComplementWeekdays(days) {
  days = new Set(days);
  return UNIQUE_DAYS.filter((day) => !days.has(day));
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
 * Say you are in Norway at the datetime 2023-10-11T00:00:00.000+02:00, then in
 * Node will display 2023-10-10T22:00:00.000Z. This function will turn it back to
 * 2023-10-11T00:00:00.000Z as a string such the date part matches the local time
 * @param {Date} date
 * @returns {string} ISO datetime string
 */
export function dateToISODatetimeWithoutOffset(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
}

/**
 * Turn Javascript date into YYYY-MM-DDTHH:MM:SSZ format with "zeroed" timezone offset
 * Say you are in Norway at the datetime 2023-10-11T00:00:00.000+02:00, then in
 * Node will display 2023-10-10T22:00:00.000Z. This function will turn it back to
 * 2023-10-11T00:00:00.000Z as a string such the date part matches the local time and then
 * remove the time part.
 * @param {Date} date
 * @returns {string} ISO datetime string
 */
export function dateToISODateWithoutOffset(date) {
  return dateToISODatetimeWithoutOffset(date).split('T')[0];
}

export const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parses ISO date string to a Date object
 * @param {string} isoDate - E.g. 2021-12-31
 * @return {Date} A date object representing the ISO date.
 */
export function ISODateToDate(isoDate) {
  if (!isoDateRegex.test(isoDate)) throw new Error(`Invalid ISO date string: ${isoDate}`);
  return new Date(isoDate);
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
 * @param {string} duration - E.g. P2DT12H30M5S
 * @returns {number} Hours
 */
export function ISODurationSubsetToHours(duration) {
  const { years, months, days, hours, minutes, seconds } = parseISODuration(duration);
  if (years || months) throw new Error('Years and months are not supported');

  return days * 24 + hours + minutes / 60 + seconds / 3600;
}
