import { calcFlexBalance } from './index.js';
import { NorwegianHoliday } from './holidays.js';
import { Day } from '../core/dates.js';

test('calcFlexBalance test case April 2022 (4 holidays)', () => {
  const referenceDate = new Date(2022, 3, 1);
  const referenceBalance = 10;
  const to = new Date(2022, 3, 30);
  const expectedWorkDays = 17;
  const expectedHoursPerDay = 7.5;
  const actualHours = 135;
  const balance = calcFlexBalance(actualHours, referenceDate, referenceBalance, {
    to,
    hoursOnHolidays: 0,
  });
  expect(balance).toEqual(actualHours - expectedWorkDays * expectedHoursPerDay + referenceBalance);
  expect(balance).toEqual(17.5);
});

test('calcFlexBalance test case April 2022 (4 holidays) with custom hours on some holidays', () => {
  const referenceDate = new Date(2022, 3, 1);
  const referenceBalance = 10;
  const to = new Date(2022, 3, 30);
  const expectedWorkDays = 17;
  const expectedHoursPerDay = 7.5;
  const actualHours = 135;
  const hoursOnHolyWednesday = 3.75;
  const balance = calcFlexBalance(actualHours, referenceDate, referenceBalance, {
    to,
    hoursOnHolidays: 0,
    hoursOnSpecificHolidays: {
      [NorwegianHoliday.HOLY_WEDNESDAY]: hoursOnHolyWednesday,
    },
  });
  expect(balance).toEqual(
    actualHours - expectedWorkDays * expectedHoursPerDay + referenceBalance - hoursOnHolyWednesday
  );
  expect(balance).toEqual(13.75);
});

test('calcFlexBalance test case April 2022 (4 holidays), and no workday on friday', () => {
  const referenceDate = new Date(2022, 3, 1);
  const referenceBalance = 10;
  const to = new Date(2022, 3, 30);
  const expectedWorkDays = 13;
  const expectedHoursPerDay = 7.5;
  const actualHours = 135;
  const balance = calcFlexBalance(actualHours, referenceDate, referenceBalance, {
    to,
    workdays: [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY],
    hoursOnHolidays: 0,
  });
  expect(balance).toEqual(actualHours - expectedWorkDays * expectedHoursPerDay + referenceBalance);
  expect(balance).toEqual(47.5);
});
