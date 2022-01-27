#!/usr/bin/env node

import dateUtils from './dateUtils.js'

import {
  setup,
  getWorkHours,
  getReferenceDate,
  getReferenceBalance,
} from './harvestContext.js'

async function run() {
  await setup()
  const workedHours = await getWorkHours()
  const referenceDate = await getReferenceDate()
  const referenceBalance = await getReferenceBalance()
  const balance = dateUtils.calcFlexBalance(
    workedHours,
    referenceDate,
    referenceBalance
  )
  console.log('referenceDate :>> ', referenceDate.toLocaleDateString("no-NB"));
  console.log('referenceBalance :>> ', referenceBalance);
  console.log('currDate :>> ', new Date().toLocaleDateString("no-NB"));
  console.log('currBalance :>> ', balance);
}

run()
// import { fileURLToPath } from "url";
// console.log('process.argv :>> ', process.argv);
// console.log('fileURLToPath(import.meta.url) :>> ', fileURLToPath(import.meta.url));
// if (process.argv[1] === fileURLToPath(import.meta.url)) {
//   run()
// }