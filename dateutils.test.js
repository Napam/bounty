// const { expect } = require("@jest/globals")
// const dateutils = require('./dateutils')
import { expect } from "@jest/globals"
import dateutils from './dateutils'

test('offsetDate works', () => {
  const date = dateutils.offsetDate(new Date(2022, 11, 18), {
    years: 2,
    months: -4,
    days: 7
  })
  expect(date).toEqual(new Date(2024, 7, 25))
})

const daysIn = {
  january2022: {
    days: 31,
    [dateutils.MONDAY]: 5,
    [dateutils.TUESDAY]: 4,
    [dateutils.WEDNESDAY]: 4,
    [dateutils.THURSDAY]: 4,
    [dateutils.FRIDAY]: 4,
    [dateutils.SATURDAY]: 5,
    [dateutils.SUNDAY]: 5
  },
  february2022: {
    days: 28,
    [dateutils.MONDAY]: 4,
    [dateutils.TUESDAY]: 4,
    [dateutils.WEDNESDAY]: 4,
    [dateutils.THURSDAY]: 4,
    [dateutils.FRIDAY]: 4,
    [dateutils.SATURDAY]: 4,
    [dateutils.SUNDAY]: 4
  },
  march2022: {
    days: 31,
    [dateutils.MONDAY]: 4,
    [dateutils.TUESDAY]: 5,
    [dateutils.WEDNESDAY]: 5,
    [dateutils.THURSDAY]: 5,
    [dateutils.FRIDAY]: 4,
    [dateutils.SATURDAY]: 4,
    [dateutils.SUNDAY]: 4
  },
  april2022: {
    days: 30,
    [dateutils.MONDAY]: 4,
    [dateutils.TUESDAY]: 4,
    [dateutils.WEDNESDAY]: 4,
    [dateutils.THURSDAY]: 4,
    [dateutils.FRIDAY]: 5,
    [dateutils.SATURDAY]: 5,
    [dateutils.SUNDAY]: 4
  }
}

test('countDays for January 2022 is correct', () => {
  const from = new Date(2022, 0, 1)
  const to = new Date(2022, 0, 31)
  expect(dateutils.countDays(from, to)).toEqual(daysIn.january2022)
})

test('countDays for February 2022 is correct', () => {
  const from = new Date(2022, 1, 1)
  const to = new Date(2022, 1, 28)
  expect(dateutils.countDays(from, to)).toEqual(daysIn.february2022)
})

test('countDays for March 2022 is correct', () => {
  const from = new Date(2022, 2, 1)
  const to = new Date(2022, 2, 31)
  expect(dateutils.countDays(from, to)).toEqual(daysIn.march2022)
})

test('countDays for April 2022 is correct', () => {
  const from = new Date(2022, 3, 1)
  const to = new Date(2022, 3, 30)
  expect(dateutils.countDays(from, to)).toEqual(daysIn.april2022)
})

test('countDays for Jan 1 2022 to April 31 2022 is correct', () => {
  const from = new Date(2022, 0, 1)
  const to = new Date(2022, 3, 30)
  expect(dateutils.countDays(from, to)).toEqual(dateutils.aggregate(Object.values(daysIn)))
})
test('slowCountDays for January 2022 is correct', () => {
  const from = new Date(2022, 0, 1)
  const to = new Date(2022, 0, 31)
  expect(dateutils.slowCountDays(from, to)).toEqual(daysIn.january2022)
})

test('slowCountDays for February 2022 is correct', () => {
  const from = new Date(2022, 1, 1)
  const to = new Date(2022, 1, 28)
  expect(dateutils.slowCountDays(from, to)).toEqual(daysIn.february2022)
})

test('slowCountDays for March 2022 is correct', () => {
  const from = new Date(2022, 2, 1)
  const to = new Date(2022, 2, 31)
  expect(dateutils.slowCountDays(from, to)).toEqual(daysIn.march2022)
})

test('slowCountDays for April 2022 is correct', () => {
  const from = new Date(2022, 3, 1)
  const to = new Date(2022, 3, 30)
  expect(dateutils.slowCountDays(from, to)).toEqual(daysIn.april2022)
})

test('slowCountDays for Jan 1 2022 to April 31 2022 is correct', () => {
  const from = new Date(2022, 0, 1)
  const to = new Date(2022, 3, 30)
  expect(dateutils.slowCountDays(from, to)).toEqual(dateutils.aggregate(Object.values(daysIn)))
})

test('slowCountDays and countDays agrees on random from/to dates', () => {
  const randInt = max => Math.floor(Math.random() * max);
  for (let i = 0; i < 2048; i++) {
    const from = new Date(1970 + randInt(200), randInt(11), randInt(31))
    const to = dateutils.offsetDate(from, { days: randInt(2920) })
    expect(dateutils.slowCountDays(from, to)).toEqual(dateutils.countDays(from, to))
  }
})

test('calcEasterDates is correct for year 2022', () => {
  expect(dateutils.calcEasterDates(2022)).toEqual({
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

test('getComplementWeekdays works', () => {
  expect(dateutils.getComplementWeekdays([dateutils.SATURDAY, dateutils.SUNDAY])).toEqual([
    dateutils.MONDAY,
    dateutils.TUESDAY,
    dateutils.WEDNESDAY,
    dateutils.THURSDAY,
    dateutils.FRIDAY
  ])
})

test('calcFlexBalance test case 1 ', () => {
  const referenceDate = new Date(2022, 0, 1)
  const referenceBalance = 12.5
  const to = new Date(2022, 0, 31)
  const expectedWorkDays = 21
  const expectedHoursPerDay = 7.5
  const actualHours = 160
  const balance = dateutils.calcFlexBalance(actualHours, referenceDate, referenceBalance, { to })
  expect(balance).toEqual(actualHours - expectedWorkDays * expectedHoursPerDay + referenceBalance)
  expect(balance).toEqual(15)
})