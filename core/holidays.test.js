import { expect } from '@jest/globals';
import * as holidays from './holidays.js';
import { Day } from './dates.js';

test('calcEasterDates is correct for year 2022', () => {
  expect(holidays.calcEasterDates(2022)).toEqual({
    palmSunday: new Date(2022, 3, 10),
    holyWednesday: new Date(2022, 3, 13),
    maundyThursday: new Date(2022, 3, 14),
    goodFriday: new Date(2022, 3, 15),
    easterSunday: new Date(2022, 3, 17),
    easterMonday: new Date(2022, 3, 18),
    ascensionDay: new Date(2022, 4, 26),
    whitsun: new Date(2022, 5, 5),
    whitMonday: new Date(2022, 5, 6),
  });
});

test('groupHolidaysByDays works for April 2022 with norwegianHolidaysGenerator', () => {
  const workdays = [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY];
  const from = new Date(2022, 3, 1);
  const to = new Date(2022, 3, 30);
  const count = holidays.groupHolidaysByDays(holidays.norwegianHolidaysGenerator(from, to), workdays);
  expect(count).toEqual({
    days: 4,
    easterMonday: 1,
    goodFriday: 1,
    holyWednesday: 1,
    maundyThursday: 1,
  });
});
