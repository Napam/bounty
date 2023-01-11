#!/usr/bin/env node

import dateUtils from './dateUtils.js'

import {
  beforeRun,
  getWorkHours,
  getReferenceDate,
  getReferenceBalance,
  getExpectedRegisteredHoursOnWorkdays,
  getExpectedRegisteredHoursOnHolidays,
  afterRun,
} from './integrations/harvest/index.js'

function incrementDateIfBeforeToday(date) {
  return dateUtils.offsetDate(date, { days: date.getTime() < dateUtils.getTodayDate().getTime() })
}

async function run() {
  await beforeRun()
  const workedHours = await getWorkHours()
  const hoursOnWorkdays = getExpectedRegisteredHoursOnWorkdays()
  const hoursOnHolidays = getExpectedRegisteredHoursOnHolidays()
  const referenceDate = await getReferenceDate()
  const referenceBalance = await getReferenceBalance()
  const from = incrementDateIfBeforeToday(referenceDate)
  const to = dateUtils.getTodayDate()
  const balance = dateUtils.calcFlexBalance(
    workedHours,
    from,
    referenceBalance,
    { to, hoursOnWorkdays, hoursOnHolidays }
  )
  await afterRun({ from, to, balance })
}

run()
