#!/usr/bin/env node

import dateUtils from './dateUtils.js'

import {
  setup,
  finish,
  getWorkHours,
  getReferenceDate,
  getReferenceBalance,
} from './harvestContext.js'

function incrementDateIfBeforeToday(date) {
  return dateUtils.offsetDate(date, { days: date.getTime() < dateUtils.getTodayDate().getTime() })
}

async function run() {
  await setup()
  const workedHours = await getWorkHours()
  const referenceDate = await getReferenceDate()
  const referenceBalance = await getReferenceBalance()
  const balance = dateUtils.calcFlexBalance(
    workedHours,
    incrementDateIfBeforeToday(referenceDate),
    referenceBalance
  )
  await finish({ workedHours, referenceDate, referenceBalance, balance })
  console.log('referenceDate :>> ', referenceDate.toLocaleDateString("no-NB"));
  console.log('referenceBalance :>> ', referenceBalance);
  console.log('currDate :>> ', new Date().toLocaleDateString("no-NB"));
  console.log('currBalance :>> ', balance);
}

run()
