import { configSchema } from './configure';

test('validate bounty config schema works', () => {
  expect(() => configSchema.validateSync({})).toThrowError();

  configSchema.validateSync(
    {
      version: '1',
      integration: 'harvest',
      hoursOnWorkdays: 3,
      hoursOnHolidays: 0,
      referenceDate: '2021-01-01',
      referenceBalance: 0,
      hoursOnSpecificHolidays: {
        newYearsEve: 0,
      },
    },
    { strict: true }
  );
});
