import { Column } from '../../store/types';
import { InputCollectionData, ScenarioIndexedInputData } from '../api/types';

/** A column, and whether the user may type into it. */
export interface EditableColumn extends Column {
  editable: boolean;
}

/** Whether the caller may write to a column, derived rather than stored. */
export const isEditable = (userID: string | null, inputs?: InputCollectionData): boolean =>
  Boolean(userID) && inputs !== undefined && Object.values(inputs).some((input) => !input.disabled);

export const withEditability = (
  columns: Column[],
  userID: string | null,
  inputData: ScenarioIndexedInputData
): EditableColumn[] =>
  columns.map((column) => ({
    ...column,
    editable: isEditable(userID, inputData[column.sessionID]),
  }));
