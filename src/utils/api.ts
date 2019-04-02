import 'whatwg-fetch';

export interface GqueryJSON {
  readonly present: number;
  readonly future: number;
  readonly unit: string;
}

export interface ScenarioJSON {
  readonly scenario: {
    readonly area_code: string;
    readonly end_year: number;
    readonly id: number;
    readonly start_year: number;
    readonly url: string;
  };

  readonly gqueries: Record<string, GqueryJSON>;
}

const endpoint = process.env.REACT_APP_ETENGINE_URL;

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

/**
 * Passes the JSON response to the promise.
 */
const parseJSON = (response: Response): Promise<ScenarioJSON> => {
  return response.json();
};

/**
 * Fetches data about a scenario from ETEngine.
 */
export const requestScenario = async (
  id: number,
  gqueries: string[] = []
): Promise<ScenarioJSON> => {
  const response = await fetch(`${endpoint}/api/v3/scenarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ gqueries }),
    headers
  });

  return parseJSON(response);
};
