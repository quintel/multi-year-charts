import 'whatwg-fetch';

import { GqueryData, ScenarioData } from './types';

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

/**
 * Receives data for an ETEngine scenario and converts scenario keys to
 * camel-case.
 */
const camelCaseScenario = (json: {
  scenario: Record<string, number | string>;
  gqueries: Record<string, GqueryData>;
}): ScenarioData => {
  const { scenario, gqueries } = json;

  return {
    gqueries,
    scenario: {
      areaCode: scenario.area_code as string,
      endYear: scenario.end_year as number,
      id: scenario.id as number,
      startYear: scenario.start_year as number,
      url: scenario.url as string
    }
  };
};

/**
 * Fetches data about a scenario from ETEngine.
 */
const requestScenario = async (
  endpoint: string,
  id: number,
  gqueries: string[] = []
): Promise<ScenarioData> => {
  const response = await fetch(`${endpoint}/api/v3/scenarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ gqueries }),
    headers
  });

  return camelCaseScenario(await response.json());
};

/**
 * Given an array of scenario IDs and a list of gqueries, returns a promise
 * which provides the JSON responses of fetching all the scenarios.
 */
const fetchQueriesForScenarios = (
  endpoint: string,
  scenarioIDs: number[],
  gqueries: string[]
): Promise<ScenarioData[]> => {
  return new Promise((resolve, reject) => {
    const responses = Promise.all(
      scenarioIDs.map(id => {
        return requestScenario(endpoint, id, gqueries);
      })
    );

    responses.then(resolve).catch(reject);
  });
};

/**
 * Encapsulates one or more ETEngine scenarios and sends requests to the API
 * as-needed.
 */
export default class APIConnection {
  endpoint: string;
  scenarios: number[];

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.scenarios = [];
  }

  setScenarios(scenarios: number[]) {
    this.scenarios = scenarios;
  }

  async sendRequest(gqueries: string[]): Promise<ScenarioData[]> {
    if (this.scenarios.length === 0) {
      return Promise.reject(
        'Cannot send API requests until one or more scenario IDs have been set.'
      );
    }

    return await fetchQueriesForScenarios(
      this.endpoint,
      this.scenarios,
      gqueries
    );
  }
}
