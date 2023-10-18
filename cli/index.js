#!/usr/bin/env node

import { offsetDate, getTodayDate } from '../core/dates.js';
import { calcFlexBalance } from '../core/index.js';
import { initalizeBountyConfig } from './configure.js';

/**
 * Integration module
 * @typedef {Object} Integration
 * @property {(from: Date, to: Date) => Promise<number> | number} getWorkHours
 * @property {(from: Date, to: Date, balance: number) => Promise<void> | void} afterRun
 */

/**
 * @param {import('./configure.js').BountyConfig} config
 * @returns {Promise<Integration>}
 */
async function getIntegration(config) {
  return await import(
    {
      harvest: '../integrations/harvest/index.js',
      clockify: '../integrations/clockify/index.js',
    }[config.integration]
  );
}

function incrementDateIfBeforeToday(date) {
  return offsetDate(date, {
    days: date.getTime() < getTodayDate().getTime(),
  });
}

async function run() {
  const bountyConfig = await initalizeBountyConfig();
  const { getWorkHours, afterRun } = await getIntegration(bountyConfig);

  const from = incrementDateIfBeforeToday(bountyConfig.referenceDate);
  const to = getTodayDate();
  const workedHours = await getWorkHours(from, to);
  const { referenceBalance, hoursOnWorkdays, hoursOnHolidays, hoursOnSpecificHolidays } = bountyConfig;
  const balance = calcFlexBalance(workedHours, from, referenceBalance, {
    to,
    hoursOnWorkdays,
    hoursOnHolidays,
    hoursOnSpecificHolidays,
  });
  await afterRun({ from, to, balance });
}

run();
