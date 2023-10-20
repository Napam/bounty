import { determineIfShouldIgnore, numberToHHMM } from './index.js';

test('determineIfShouldIgnore works', () => {
  expect(
    determineIfShouldIgnore(
      {
        projectName: 'project1',
      },
      { projectName: 'project1', clientName: 'test', label: 'test' }
    )
  ).toEqual(true);

  expect(
    determineIfShouldIgnore(
      {
        projectName: 'project2',
        clientName: 'client2',
      },
      { projectName: 'project2', clientName: 'client2', label: 'test' }
    )
  ).toEqual(true);

  expect(
    determineIfShouldIgnore(
      {
        projectName: 'project3',
        clientName: 'client3',
        label: 'label3',
      },
      { projectName: 'project3', clientName: 'client3', label: 'label3' }
    )
  ).toEqual(true);

  expect(
    determineIfShouldIgnore(
      {
        projectName: 'project3',
        clientName: 'client3',
        label: 'label3',
      },
      { projectName: 'project2', clientName: 'client2' }
    )
  ).toEqual(false);

  expect(
    determineIfShouldIgnore(
      {
        projectName: 'project2',
      },
      { projectName: 'project' }
    )
  ).toEqual(false);
});

test('numberToHHMM works', () => {
  expect(numberToHHMM(23.75)).toEqual('23:45');
});
