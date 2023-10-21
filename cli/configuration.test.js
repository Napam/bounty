import { configSchema } from './configuration';

test('validate bounty config schema throws error on empty object', () => {
  expect(() => configSchema.validateSync({})).toThrowError();
});

test('validate bounty config schema works on valid config', () => {
  configSchema.validateSync(
    {
      version: '1',
      integration: 'harvest',
      workdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
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
