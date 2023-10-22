import { applyFilters } from './index.js';

test('applyFilters works', () => {
  let filters = [
    {
      project: 'Project1',
      task: 'Development',
    },
    {
      project: 'Project2',
      task: 'Meetings',
    },
    {
      project: 'Project3',
      task: 'Cleaning',
    },
    {
      project: 'Project4',
    },
    {
      task: 'Testing',
    },
  ];

  expect(applyFilters(filters, { project: { name: 'Project1' }, task: { name: 'Development' } })).toEqual(
    true
  );

  expect(applyFilters(filters, { project: { name: 'Project2' }, task: { name: 'Meetings' } })).toEqual(true);

  expect(applyFilters(filters, { project: { name: 'Project2' }, task: { name: 'Development' } })).toEqual(
    false
  );
  expect(applyFilters(filters, { project: { name: 'Project3' }, task: { name: 'Meetings' } })).toEqual(false);

  expect(applyFilters(filters, { project: { name: 'Project3' }, task: { name: 'Testing' } })).toEqual(true);

  expect(applyFilters(filters, { project: { name: 'Project4' }, task: { name: 'Development' } })).toEqual(
    true
  );

  expect(applyFilters(filters, { project: { name: 'Project5' }, task: { name: 'Standup' } })).toEqual(false);
});
