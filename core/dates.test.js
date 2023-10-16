import { expect } from '@jest/globals';
import * as dates from './dates.js';

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

test('aggregate works', () => {
  const objects = [
    { a: 1, b: 2 },
    { a: 3, b: 4 },
    { a: 5, b: 6 },
  ];
  const aggregator = (x, y) => x + y;
  const expected = { a: 9, b: 12 };

  const result = aggregate(objects, aggregator);

  expect(result).toEqual(expected);
});

test('offsetDate', () => {
  expect(dates.offsetDate(new Date(2022, 11, 18), { years: 2, months: -4, days: 7 })).toEqual(
    new Date(2024, 7, 25)
  );
});

test('offsetISODate', () => {
  expect(dates.offsetISODate('2022-07-11', { years: 1, months: -1, days: -1 })).toEqual('2023-06-10');
});

test('ISOToMS', () => {
  const date = new Date(2022, 2, 22);
  expect(dates.ISOToMs('2022-03-22')).toEqual(date.getTime());
});

const daysIn = {
  january2022: {
    days: 31,
    [dates.Day.MONDAY]: 5,
    [dates.Day.TUESDAY]: 4,
    [dates.Day.WEDNESDAY]: 4,
    [dates.Day.THURSDAY]: 4,
    [dates.Day.FRIDAY]: 4,
    [dates.Day.SATURDAY]: 5,
    [dates.Day.SUNDAY]: 5,
  },
  february2022: {
    days: 28,
    [dates.Day.MONDAY]: 4,
    [dates.Day.TUESDAY]: 4,
    [dates.Day.WEDNESDAY]: 4,
    [dates.Day.THURSDAY]: 4,
    [dates.Day.FRIDAY]: 4,
    [dates.Day.SATURDAY]: 4,
    [dates.Day.SUNDAY]: 4,
  },
  march2022: {
    days: 31,
    [dates.Day.MONDAY]: 4,
    [dates.Day.TUESDAY]: 5,
    [dates.Day.WEDNESDAY]: 5,
    [dates.Day.THURSDAY]: 5,
    [dates.Day.FRIDAY]: 4,
    [dates.Day.SATURDAY]: 4,
    [dates.Day.SUNDAY]: 4,
  },
  april2022: {
    days: 30,
    [dates.Day.MONDAY]: 4,
    [dates.Day.TUESDAY]: 4,
    [dates.Day.WEDNESDAY]: 4,
    [dates.Day.THURSDAY]: 4,
    [dates.Day.FRIDAY]: 5,
    [dates.Day.SATURDAY]: 5,
    [dates.Day.SUNDAY]: 4,
  },
};

test('countDays for January 2022 is correct', () => {
  const from = new Date(2022, 0, 1);
  const to = new Date(2022, 0, 31);
  expect(dates.countDays(from, to)).toEqual(daysIn.january2022);
});

test('countDays for February 2022 is correct', () => {
  const from = new Date(2022, 1, 1);
  const to = new Date(2022, 1, 28);
  expect(dates.countDays(from, to)).toEqual(daysIn.february2022);
});

test('countDays for March 2022 is correct', () => {
  const from = new Date(2022, 2, 1);
  const to = new Date(2022, 2, 31);
  expect(dates.countDays(from, to)).toEqual(daysIn.march2022);
});

test('countDays for April 2022 is correct', () => {
  const from = new Date(2022, 3, 1);
  const to = new Date(2022, 3, 30);
  expect(dates.countDays(from, to)).toEqual(daysIn.april2022);
});

test('countDays for Jan 1 2022 to April 31 2022 is correct', () => {
  const from = new Date(2022, 0, 1);
  const to = new Date(2022, 3, 30);
  expect(dates.countDays(from, to)).toEqual(aggregate(Object.values(daysIn)));
});
test('slowCountDays for January 2022 is correct', () => {
  const from = new Date(2022, 0, 1);
  const to = new Date(2022, 0, 31);
  expect(dates.slowCountDays(from, to)).toEqual(daysIn.january2022);
});

test('slowCountDays for February 2022 is correct', () => {
  const from = new Date(2022, 1, 1);
  const to = new Date(2022, 1, 28);
  expect(dates.slowCountDays(from, to)).toEqual(daysIn.february2022);
});

test('slowCountDays for March 2022 is correct', () => {
  const from = new Date(2022, 2, 1);
  const to = new Date(2022, 2, 31);
  expect(dates.slowCountDays(from, to)).toEqual(daysIn.march2022);
});

test('slowCountDays for April 2022 is correct', () => {
  const from = new Date(2022, 3, 1);
  const to = new Date(2022, 3, 30);
  expect(dates.slowCountDays(from, to)).toEqual(daysIn.april2022);
});

test('slowCountDays for Jan 1 2022 to April 31 2022 is correct', () => {
  const from = new Date(2022, 0, 1);
  const to = new Date(2022, 3, 30);
  expect(dates.slowCountDays(from, to)).toEqual(aggregate(Object.values(daysIn)));
});

test('slowCountDays and countDays agrees on random from/to dates', () => {
  const randInt = (max) => Math.floor(Math.random() * max);
  for (let i = 0; i < 2048; i++) {
    const from = new Date(1970 + randInt(200), randInt(11), randInt(31));
    const to = dates.offsetDate(from, { days: randInt(2920) });
    expect(dates.slowCountDays(from, to)).toEqual(dates.countDays(from, to));
  }
});

test('getComplementWeekdays works', () => {
  expect(dates.getComplementWeekdays([dates.Day.SATURDAY, dates.Day.SUNDAY])).toEqual([
    dates.Day.MONDAY,
    dates.Day.TUESDAY,
    dates.Day.WEDNESDAY,
    dates.Day.THURSDAY,
    dates.Day.FRIDAY,
  ]);
});

test('parseISODuration works', () => {
  const components = dates.parseISODuration('P1Y2M3DT4H5M6S');
  expect(components).toEqual({
    years: 1,
    months: 2,
    days: 3,
    hours: 4,
    minutes: 5,
    seconds: 6,
  });
});

test('ISODurationToDate works', () => {
  const date = dates.ISODurationToDate('P1Y2M3DT4H5M6S');
  expect(date).toEqual(new Date(1, 2, 3, 4, 5, 6));
});
