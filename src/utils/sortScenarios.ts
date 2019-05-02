import { ScenarioData } from './api/types';

/**
 * Given the list of active scenarios, sorts them in ascending order of their
 * end year.
 */
export default (scenarios: ScenarioData[]) => {
  return scenarios.sort((a, b) => {
    return a.scenario.endYear - b.scenario.endYear;
  });
};
