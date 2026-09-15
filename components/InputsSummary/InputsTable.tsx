import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Section from './Section';
import HierarchyLevel from './HierarchyLevel';
import { Selection } from './Row';
import InputsBreadcrumb from '../InputsBreadcrumb';
import { InputValue, ScenarioIndexedInputData, ScenarioIndexedScenarioData } from '../../utils/api/types';
import { ColumnEditing } from '../../store/types';
import { EditableColumn } from '../../utils/inputs/access';
import { buildHierarchy, scopeContents, Slide } from '../../utils/inputs/hierarchy';
import { heldGroups } from '../../utils/inputs/shareGroups';
import { maxTableWidth, minTableWidth, nameColumnWidth, stickyName, valueColumnCount } from '../../utils/inputs/layout';
import { scopePath, showingAllInputs, withAllInputs } from '../../utils/inputs/urls';
import { hasEdits, hasRows } from '../../utils/inputs/visibility';
import useLinkHelper from '../../utils/useLinkHelper';
import useTranslate from '../../utils/useTranslate';

interface InputsTableProps {
  columns: EditableColumn[];
  editing: Record<number, ColumnEditing>;
  inputs: ScenarioIndexedInputData;
  scenarios: ScenarioIndexedScenarioData;
  inputList: Slide[];
  onCommitValue: (sessionID: number, inputKey: string, value: InputValue) => void;
  onResetValue: (sessionID: number, inputKey: string) => void;
  openModal: (scenarioID: number, inputKey?: string) => void;
}

const InputsTable: React.FC<InputsTableProps> = ({ columns, editing, inputs, scenarios, inputList, onCommitValue, onResetValue, openModal }) => {
  const router = useRouter();
  const translate = useTranslate();
  const { linkTo } = useLinkHelper();

  // Focus
  const [selection, setSelection] = useState<Selection | null>(null);

  const showAllInputs = showingAllInputs(router.query);
  const scope = [router.query.scope].flat().filter(Boolean) as string[];

  const userValues = useMemo(
    () =>
      Object.fromEntries(
        columns.map(({ sessionID }) => [sessionID, scenarios[sessionID].userValues || {}])
      ),
    [columns, scenarios]
  );

  // A closed group is 'held' until it totals 100
  const held = useMemo(
    () =>
      Object.fromEntries(
        columns.map(({ sessionID }) => [
          sessionID,
          heldGroups(inputs[sessionID], editing[sessionID]?.values ?? {}, userValues[sessionID]),
        ])
      ),
    [columns, inputs, editing, userValues]
  );

  // Columns are already in display order, because the reducer derives the scenario list from them
  const columnScenarios = columns.map(({ sessionID }) => scenarios[sessionID].scenario);
  const valueColumns = valueColumnCount(columns.length);

  const structure = useMemo(
    () =>
      buildHierarchy(
        inputList,
        (slide) => hasRows(slide.input_elements, inputs, columns),
        (slide) => hasEdits(slide.input_elements, inputs)
      ),
    [inputList, inputs, columns]
  );

  const { trail, slide, levels } = scopeContents(structure, scope, showAllInputs);

  const resolvedHref = linkTo(withAllInputs(scopePath(trail), showAllInputs));
  const unresolved = structure.length > 0 && trail.length < scope.length;

  // A slug naming no level, from a stale link or a locale switch, drops back to the nearest level
  useEffect(() => {
    if (unresolved) {
      router.replace(resolvedHref);
    }
  }, [router, unresolved, resolvedHref]);

  // Everything a section needs to render its input rows, minus the slide it renders
  const slideProps = {
    columns,
    editing,
    held,
    inputData: inputs,
    onCommitValue,
    onResetValue,
    onSelect: setSelection,
    selection,
    userValues,
  };

  return (
    <>
      <div className="mb-5 flex items-center">
        <InputsBreadcrumb roots={structure} showAll={showAllInputs} trail={trail} />
      </div>

      {/* Table structure to display the inputs */}
      <div className="overflow-x-auto">
      <table
        className="mx-auto w-full text-sm"
        style={{
          minWidth: minTableWidth(columns.length),
          maxWidth: maxTableWidth(columns.length),
        }}
      >
        <thead>
          <tr className='border-b-2 border-b-gray-300'>
            <th className={`${stickyName} p-2 text-left font-semibold`} style={{ width: nameColumnWidth }}>Category/Input</th>
            <th className="p-2 text-right font-semibold">{translate('inputs.unit')}</th>
            <th className="p-2 text-right font-semibold">
              {columnScenarios[0].startYear}
            </th>
            {columns.map(({ sessionID }, index) => (
              <th key={`year-${sessionID}`} className="p-2 text-right group">
                <button
                  type="button"
                  aria-label="Open scenario in pop up"
                  onClick={() => openModal(sessionID)}
                  className="-my-1 -mx-2 cursor-pointer rounded py-1 px-2 text-myetm-900 hover:bg-gray-100 hover:text-midnight-900 active:bg-gray-200 active:text-midnight-900"
                >
                  {columnScenarios[index].endYear}
                </button>
                <div className="absolute transform translate-y-1/2 mb-2 hidden group-hover:block px-3 py-1 text-sm font-normal text-black bg-white rounded-md shadow-lg border border-gray-200 whitespace-nowrap z-50">
                  Open scenario in pop up
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!slide && levels.length === 0 && (
            <tr className="border-b border-b-gray-300">
              <td className="p-2 text-left text-gray-600" colSpan={valueColumns + 1}>
                {translate('inputs.none')}
              </td>
            </tr>
          )}
          {slide && <Section slide={slide} {...slideProps} />}
          {levels.map((level) => (
            <HierarchyLevel
              key={level.key}
              node={level}
              depth={trail.length}
              path={scopePath(trail)}
              showAll={showAllInputs}
              slideProps={slideProps}
              valueColumns={valueColumns}
            />
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
};

export default InputsTable;
