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
