import { expect } from '@jest/globals';
import { replaceEnvPlaceholders } from './placeholders.js';

test('replaceEnvPlaceholders works for flat object', () => {
  const envMap = {
    HAHA: 'mamma mia',
  };

  const target = {
    apiKey: '${HAHA}',
  };

  const result = replaceEnvPlaceholders(envMap, target);

  expect(result).toEqual({
    apiKey: 'mamma mia',
  });
});

test('replaceEnvPlaceholders works for nested object', () => {
  const envMap = {
    MOMS: 'SPAGHETTI',
  };

  const config = {
    eminem: {
      food: '${MOMS}',
    },
  };

  const result = replaceEnvPlaceholders(envMap, config);
  expect(result).toEqual({
    eminem: {
      food: 'SPAGHETTI',
    },
  });
});

test('replaceEnvPlaceholders works for placeholder within other text', () => {
  const envMap = {
    THE_FOOD: 'SPAGHETTI',
  };

  const config = {
    eminem: {
      food: 'MOMS ${THE_FOOD}!',
    },
  };

  const result = replaceEnvPlaceholders(envMap, config);
  expect(result).toEqual({
    eminem: {
      food: 'MOMS SPAGHETTI!',
    },
  });
});

test('replaceEnvPlaceholders works for multiple placeholders within other text', () => {
  const envMap = {
    THE_FOOD: 'SPAGHETTI',
    PERSON: 'EMINEM',
  };

  const config = {
    eminem: {
      food: '${PERSON}S MOMS ${THE_FOOD}!',
    },
  };

  const result = replaceEnvPlaceholders(envMap, config);
  expect(result).toEqual({
    eminem: {
      food: 'EMINEMS MOMS SPAGHETTI!',
    },
  });
});

test('replaceEnvPlaceholders works for same placeholder repeated', () => {
  const envMap = {
    THE_FOOD: 'SPAGHETTI',
    PERSON: 'EMINEM',
  };

  const config = {
    eminem: {
      food: '${PERSON}S MOMS ${THE_FOOD}! ${THE_FOOD}!',
    },
  };

  const result = replaceEnvPlaceholders(envMap, config);
  expect(result).toEqual({
    eminem: {
      food: 'EMINEMS MOMS SPAGHETTI! SPAGHETTI!',
    },
  });
});
