// import 'whatwg-fetch';

import {
  GqueryData,
  InputCollectionData,
  ScenarioData,
  ScenarioIndexedInputData,
  ScenarioIndexedScenarioData,
} from './types';

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
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
      url: scenario.url as string,
    },
  };
};

/**
 * Receives a list of scenario IDs and data corresponding to each scenario and
 * return a record of the data indexed by the ID.
 */
const indexByScenario = <T>(scenarioIDs: number[], data: T[]) => {
  const byScenario: Record<number, T> = {};
  scenarioIDs.map((id, index) => (byScenario[id] = data[index]));

  return byScenario;
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
    headers,
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
): Promise<ScenarioIndexedScenarioData> => {
  return new Promise((resolve, reject) => {
    const responses = Promise.all(
      scenarioIDs.map((id) => {
        return requestScenario(endpoint, id, gqueries);
      })
    );

    responses
      .then((data: ScenarioData[]) => {
        resolve(indexByScenario(scenarioIDs, data));
      })
      .catch(reject);
  });
};

/**
 * Fetches the complete list of inputs available for a scenario, including
 * custom values set by the creator of the scenario.
 */
const fetchInputsForScenario = async (
  endpoint: string,
  id: number
): Promise<InputCollectionData> => {
  const response = await fetch(`${endpoint}/api/v3/scenarios/${id}/inputs.json`, { headers });

  return await response.json();
};

/**
 * Fetches the complete list of inputs available for a list of scenarios,
 * returning a promise which yields the result of each request.
 */
const fetchInputsForScenarios = (
  endpoint: string,
  scenarioIDs: number[]
): Promise<ScenarioIndexedInputData> => {
  return new Promise((resolve, reject) => {
    const responses = Promise.all(scenarioIDs.map((id) => fetchInputsForScenario(endpoint, id)));

    responses
      .then((data: InputCollectionData[]) => {
        resolve(indexByScenario(scenarioIDs, data));
      })
      .catch(reject);
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

  async sendRequest(gqueries: string[]): Promise<ScenarioIndexedScenarioData> {
    if (this.scenarios.length === 0) {
      return Promise.reject(
        'Cannot send API requests until one or more scenario IDs have been set.'
      );
    }

    return await fetchQueriesForScenarios(this.endpoint, this.scenarios, gqueries);
  }

  async fetchInputs(): Promise<ScenarioIndexedInputData> {
    if (this.scenarios.length === 0) {
      return Promise.reject(
        'Cannot send API requests until one or more scenario IDs have been set.'
      );
    }

    return await fetchInputsForScenarios(this.endpoint, this.scenarios);
  }
}
