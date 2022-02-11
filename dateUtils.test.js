import { expect } from "@jest/globals"
import dateUtils from './dateUtils.js'

test('offsetDate', () => {
  const date = dateUtils.offsetDate(new Date(2022, 11, 18), {
    years: 2,
    months: -4,
    days: 7
  })
  expect(date).toEqual(new Date(2024, 7, 25))
})

test('offsetISODate', () => {
  expect(dateUtils.offsetISODate('2022-07-11', { years: 1, months: -1, days: -1 }))
    .toEqual('2023-06-10')
})

test('ISOToMS', () => {
  const date = new Date(2022, 2, 22)
  expect(dateUtils.ISOToMs('2022-03-22')).toEqual(date.getTime())
})

const daysIn = {
  january2022: {
    days: 31,
    [dateUtils.MONDAY]: 5,
    [dateUtils.TUESDAY]: 4,
    [dateUtils.WEDNESDAY]: 4,
    [dateUtils.THURSDAY]: 4,
    [dateUtils.FRIDAY]: 4,
    [dateUtils.SATURDAY]: 5,
    [dateUtils.SUNDAY]: 5
  },
  february2022: {
    days: 28,
    [dateUtils.MONDAY]: 4,
    [dateUtils.TUESDAY]: 4,
    [dateUtils.WEDNESDAY]: 4,
    [dateUtils.THURSDAY]: 4,
    [dateUtils.FRIDAY]: 4,
    [dateUtils.SATURDAY]: 4,
    [dateUtils.SUNDAY]: 4
  },
  march2022: {
    days: 31,
    [dateUtils.MONDAY]: 4,
    [dateUtils.TUESDAY]: 5,
    [dateUtils.WEDNESDAY]: 5,
    [dateUtils.THURSDAY]: 5,
    [dateUtils.FRIDAY]: 4,
    [dateUtils.SATURDAY]: 4,
    [dateUtils.SUNDAY]: 4
  },
  april2022: {
    days: 30,
    [dateUtils.MONDAY]: 4,
    [dateUtils.TUESDAY]: 4,
    [dateUtils.WEDNESDAY]: 4,
    [dateUtils.THURSDAY]: 4,
    [dateUtils.FRIDAY]: 5,
    [dateUtils.SATURDAY]: 5,
    [dateUtils.SUNDAY]: 4
  }
}

test('countDays for January 2022 is correct', () => {
  const from = new Date(2022, 0, 1)
  const to = new Date(2022, 0, 31)
  expect(dateUtils.countDays(from, to)).toEqual(daysIn.january2022)
})

test('countDays for February 2022 is correct', () => {
  const from = new Date(2022, 1, 1)
  const to = new Date(2022, 1, 28)
  expect(dateUtils.countDays(from, to)).toEqual(daysIn.february2022)
})

test('countDays for March 2022 is correct', () => {
  const from = new Date(2022, 2, 1)
  const to = new Date(2022, 2, 31)
  expect(dateUtils.countDays(from, to)).toEqual(daysIn.march2022)
})

test('countDays for April 2022 is correct', () => {
  const from = new Date(2022, 3, 1)
  const to = new Date(2022, 3, 30)
  expect(dateUtils.countDays(from, to)).toEqual(daysIn.april2022)
})

test('countDays for Jan 1 2022 to April 31 2022 is correct', () => {
  const from = new Date(2022, 0, 1)
  const to = new Date(2022, 3, 30)
  expect(dateUtils.countDays(from, to)).toEqual(dateUtils.aggregate(Object.values(daysIn)))
})
test('slowCountDays for January 2022 is correct', () => {
  const from = new Date(2022, 0, 1)
  const to = new Date(2022, 0, 31)
  expect(dateUtils.slowCountDays(from, to)).toEqual(daysIn.january2022)
})

test('slowCountDays for February 2022 is correct', () => {
  const from = new Date(2022, 1, 1)
  const to = new Date(2022, 1, 28)
  expect(dateUtils.slowCountDays(from, to)).toEqual(daysIn.february2022)
})

test('slowCountDays for March 2022 is correct', () => {
  const from = new Date(2022, 2, 1)
  const to = new Date(2022, 2, 31)
  expect(dateUtils.slowCountDays(from, to)).toEqual(daysIn.march2022)
})

test('slowCountDays for April 2022 is correct', () => {
  const from = new Date(2022, 3, 1)
  const to = new Date(2022, 3, 30)
  expect(dateUtils.slowCountDays(from, to)).toEqual(daysIn.april2022)
})

test('slowCountDays for Jan 1 2022 to April 31 2022 is correct', () => {
  const from = new Date(2022, 0, 1)
  const to = new Date(2022, 3, 30)
  expect(dateUtils.slowCountDays(from, to)).toEqual(dateUtils.aggregate(Object.values(daysIn)))
})

test('slowCountDays and countDays agrees on random from/to dates', () => {
  const randInt = max => Math.floor(Math.random() * max);
  for (let i = 0; i < 2048; i++) {
    const from = new Date(1970 + randInt(200), randInt(11), randInt(31))
    const to = dateUtils.offsetDate(from, { days: randInt(2920) })
    expect(dateUtils.slowCountDays(from, to)).toEqual(dateUtils.countDays(from, to))
  }
})

test('calcEasterDates is correct for year 2022', () => {
  expect(dateUtils.calcEasterDates(2022)).toEqual({
    palmSunday: new Date(2022, 3, 10),
    maundyThursday: new Date(2022, 3, 14),
    goodFriday: new Date(2022, 3, 15),
    easterSunday: new Date(2022, 3, 17),
    easterMonday: new Date(2022, 3, 18),
    ascensionDay: new Date(2022, 4, 26),
    whitsun: new Date(2022, 5, 5),
    whitMonday: new Date(2022, 5, 6)
  })
})

test('countHolidaysInWorkDays works for April 2022 with norwegianHolidaysGenerator', () => {
  const workdays = [
    dateUtils.MONDAY,
    dateUtils.TUESDAY,
    dateUtils.WEDNESDAY,
    dateUtils.THURSDAY,
    dateUtils.FRIDAY
  ]
  const from = new Date(2022, 3, 1)
  const to = new Date(2022, 3, 30)
  const count = dateUtils.countHolidaysInWorkdays(dateUtils.norwegianHolidaysGenerator(from, to), workdays)
  expect(count).toEqual(3)
})

test('getComplementWeekdays works', () => {
  expect(dateUtils.getComplementWeekdays([dateUtils.SATURDAY, dateUtils.SUNDAY])).toEqual([
    dateUtils.MONDAY,
    dateUtils.TUESDAY,
    dateUtils.WEDNESDAY,
    dateUtils.THURSDAY,
    dateUtils.FRIDAY
  ])
})

test('calcFlexBalance test case January 2022 ', () => {
  const referenceDate = new Date(2022, 0, 1)
  const referenceBalance = 12.5
  const to = new Date(2022, 0, 31)
  const expectedWorkDays = 21
  const expectedHoursPerDay = 7.5
  const actualHours = 160
  const balance = dateUtils.calcFlexBalance(actualHours, referenceDate, referenceBalance, { to })
  expect(balance).toEqual(actualHours - expectedWorkDays * expectedHoursPerDay + referenceBalance)
  expect(balance).toEqual(15)
})

test('calcFlexBalance test case April 2022 (3 holidays)', () => {
  const referenceDate = new Date(2022, 3, 1)
  const referenceBalance = 10
  const to = new Date(2022, 3, 30)
  const expectedWorkDays = 18
  const expectedHoursPerDay = 7.5
  const actualHours = 135
  const balance = dateUtils.calcFlexBalance(actualHours, referenceDate, referenceBalance, { to })
  expect(balance).toEqual(actualHours - expectedWorkDays * expectedHoursPerDay + referenceBalance)
  expect(balance).toEqual(10)
})