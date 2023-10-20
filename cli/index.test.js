import { incrementDateIfBeforeToday } from './index.js';

test('incrementDateIfBeforeToday increments date if before today', () => {
  const date = new Date(1970, 0, 1);
  expect(incrementDateIfBeforeToday(date)).toEqual(new Date(1970, 0, 2));
});

test('incrementDateIfBeforeToday does not increment date of today', () => {
  const date = new Date();
  expect(incrementDateIfBeforeToday(date)).toEqual(date);
});
