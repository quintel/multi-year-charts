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

  readonly userValues: Record<string, InputValue>;
  readonly balancedValues: Record<string, InputValue>;

  order: number;
}

export type InputValue = number | string;

/** @todo share_group should be camel-cased */
export interface InputData {
  min?: number;
  max?: number;
  default: InputValue;
  unit: string;
  user?: InputValue;
  step?: number;
  permitted_values?: string[];
  disabled: boolean;
  disabled_by?: string[];
  coupling_disabled?: boolean;
  share_group?: string;
  code?: string;
}

export interface InputCollectionData {
  [key: string]: InputData;
}

export type ScenarioIndexedScenarioData = Record<number, ScenarioData>;
export type ScenarioIndexedInputData = Record<number, InputCollectionData>;
