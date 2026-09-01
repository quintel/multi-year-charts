// import 'whatwg-fetch';

import { Column } from '../../store/types';
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

const SESSION_REFRESH_URL = `${process.env.NEXT_PUBLIC_MYETM_URL}/session/refresh`;

// Fetch wrapper that, on a 401 (the shared session cookie expired between the keeper's proactive
// refreshes), refreshes the cookie once via MyETM and retries. /session/refresh re-sets etm_session
// on the parent domain, so the retried same-origin request carries the fresh cookie to the proxy.
const fetchWithRefresh = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  const response = await fetch(input, init);
  if (response.status !== 401) return response;

  const refreshed = await fetch(SESSION_REFRESH_URL, { method: 'POST', credentials: 'include' })
    .then((res) => res.ok)
    .catch(() => false);

  return refreshed ? fetch(input, init) : response;
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
    order: 0,
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
  const response = await fetchWithRefresh(`/api/scenarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ gqueries }),
    headers,
  });

  if (!response.ok) {
    throw new Error(response.status.toString());
  }

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
 * Fetches the complete list of inputs available for a scenario
 */
const fetchInputsForScenario = async (
  endpoint: string,
  id: number
): Promise<InputCollectionData> => {
  const response = await fetchWithRefresh(`/api/scenarios/${id}/inputs?include_extras=true`, {
    method: 'GET',
    headers,
  });

  return await response.json();
};

/**
 * Fetches the complete list of inputs available for a list of columns,
 * returning a promise which yields the result of each request.
 */
const fetchInputsForColumns = async (
  endpoint: string,
  columns: Column[]
): Promise<ScenarioIndexedInputData> => {
  const sessionIDs = columns.map((column) => column.sessionID);
  const data = await Promise.all(sessionIDs.map((id) => fetchInputsForScenario(endpoint, id)));

  return indexByScenario(sessionIDs, data);
};

/**
 * Encapsulates one or more ETEngine scenarios and sends requests to the API
 * as-needed.
 */
export default class APIConnection {
  endpoint: string;
  columns: Column[];

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.columns = [];
  }

  setColumns(columns: Column[]) {
    this.columns = columns;
  }

  async sendRequest(gqueries: string[]): Promise<ScenarioIndexedScenarioData> {
    if (this.columns.length === 0) {
      return Promise.reject('Cannot send API requests until one or more columns have been set.');
    }

    return await fetchQueriesForScenarios(
      this.endpoint,
      this.columns.map((column) => column.sessionID),
      gqueries
    );
  }

  async fetchInputs(): Promise<ScenarioIndexedInputData> {
    if (this.columns.length === 0) {
      return Promise.reject('Cannot send API requests until one or more columns have been set.');
    }

    return await fetchInputsForColumns(this.endpoint, this.columns);
  }
}
