import 'whatwg-fetch';

export interface GqueryData {
  readonly present: number;
  readonly future: number;
  readonly unit: string;
}

export interface ScenarioData {
  readonly scenario: {
    readonly areaCode: string;
    readonly endYear: number;
    readonly id: number;
    readonly startYear: number;
    readonly url: string;
  };

  readonly gqueries: Record<string, GqueryData>;
}

const endpoint = process.env.REACT_APP_ETENGINE_URL;

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

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
export const requestScenario = async (
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
export const fetchQueriesForScenarios = (
  scenarioIDs: number[],
  gqueries: string[]
): Promise<ScenarioData[]> => {
  return new Promise((resolve, reject) => {
    const responses = Promise.all(
      scenarioIDs.map(id => {
        return requestScenario(id, gqueries);
      })
    );

    responses.then(resolve).catch(reject);
  });
};
