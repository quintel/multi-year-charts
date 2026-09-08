import { ScenarioData } from './api/types';
import { useRouter } from 'next/router';

/**
 * Given the list of active scenarios, sorts them into the order their columns are shown in.
 */
export default function sortSceanrios(scenarios: ScenarioData[]) {
  return scenarios.sort((a, b) => {
    return a.order - b.order;
  });
}
