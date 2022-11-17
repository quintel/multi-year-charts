import { ScenarioData } from './api/types';
import { useRouter } from 'next/router';

/**
 * Given the list of active scenarios, sorts them in ascending order of their
 * end year.
 */
export default function sortSceanrios(scenarios: ScenarioData[]) {
  return scenarios.sort((a, b) => {
    return a.order - b.order;
  });
}
