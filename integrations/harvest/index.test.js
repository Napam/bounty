import { applyFilters } from './index.js';

test('applyFilters works', () => {
  let filters = [
    {
      projectName: 'Project1',
      taskName: 'Development',
    },
    {
      projectName: 'Project2',
      taskName: 'Meetings',
    },
    {
      projectName: 'Project3',
      taskName: 'Cleaning',
    },
  ];

  expect(applyFilters(filters, { projectName: 'Project1', taskName: 'Development' })).toEqual(true);
  expect(applyFilters(filters, { projectName: 'Project2', taskName: 'Meetings' })).toEqual(true);
  expect(applyFilters(filters, { projectName: 'Project2', taskName: 'Development' })).toEqual(false);
  expect(applyFilters(filters, { projectName: 'Project3', taskName: 'Meetings' })).toEqual(false);
});
