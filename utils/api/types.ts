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

  order: number;
}

/** @todo share_group should be camel-cased */
export interface InputData {
  min: number;
  max: number;
  default: number;
  user?: number;
  disabled: boolean;
  coupling_disabled?: boolean;
  share_group?: string;
}

export interface InputCollectionData {
  [key: string]: InputData;
}

export type ScenarioIndexedScenarioData = Record<number, ScenarioData>;
export type ScenarioIndexedInputData = Record<number, InputCollectionData>;
