import { setupFilesInHomeAndPromptForInfo, getConfig } from './utils.js';

export async function beforeRun() {
  await setupFilesInHomeAndPromptForInfo();
}

export function getReferenceDate() {
  const config = getConfig();
  if (config.referenceDate) return isodateToDate(config.referenceDate);

  throw new Error('Improper configuration of config');
}

export function getReferenceBalance() {
  const config = getConfig();
  if (config.referenceBalance != null) return config.referenceBalance;

  throw new Error('Improper configuration of config');
}

export async function getWorkHours() {
  const config = getConfig();
}

export function getExpectedRegisteredHoursOnWorkdays() {
  const config = getConfig();
  if (config.expectedRegisteredHoursOnWorkdays) return config.expectedRegisteredHoursOnWorkdays;

  throw new Error('Improper configuration of config');
}

export function getExpectedRegisteredHoursOnHolidays() {
  const config = getConfig();
  if (config.expectedRegisteredHoursOnHolidays) return config.expectedRegisteredHoursOnHolidays;

  throw new Error('Improper configuration of config');
}

export async function afterRun({ from, to, balance }) {}
