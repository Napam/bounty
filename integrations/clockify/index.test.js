import { applyFilters, numberToHHMM } from './index.js';

test('filter works', () => {
  const filters = [
    { projectName: 'Project1' },
    { projectName: 'Project2', clientName: 'Client2' },
    { projectName: 'Project3', clientName: 'Client3', label: 'Label3' },
  ];

  expect(applyFilters(filters, { projectName: 'Project1', clientName: 'test', label: 'test' })).toEqual(true);
  expect(applyFilters(filters, { projectName: 'Project2', clientName: 'Client2', label: 'test' })).toEqual(true);
  expect(applyFilters(filters, { projectName: 'Project3', clientName: 'Client3', label: 'Label3' })).toEqual(true);

  expect(applyFilters(filters, { projectName: 'Project2' })).toEqual(false);
  expect(applyFilters(filters, { projectName: 'Project3', clientName: 'Client3', label: 'Test' })).toEqual(false);
  expect(applyFilters(filters, { projectName: 'Project4' })).toEqual(false);
});

test('numberToHHMM works', () => {
  expect(numberToHHMM(23.75)).toEqual('23:45');
});
