import React, { useState, useEffect, useMemo } from 'react';
import Section from './Section';
import HierarchyLevel from './HierarchyLevel';
import { Selection } from './Row';
import { Option } from '../ChartWrapper/UnitToggle'
import { InputValue, ScenarioIndexedInputData, ScenarioIndexedScenarioData } from '../../utils/api/types';
import { ColumnEditing } from '../../store/types';
import { EditableColumn } from '../../utils/inputs/access';
import { allKeys, buildHierarchy, groupedByName, keysByLevel, Slide } from '../../utils/inputs/hierarchy';
import { heldGroups } from '../../utils/inputs/shareGroups';
import { maxTableWidth, minTableWidth, nameColumnWidth, stickyName, valueColumnCount } from '../../utils/inputs/layout';
import useTranslate from '../../utils/useTranslate';
import { serializeTableState, parseTableState} from '../../utils/tableState';
import { RadioGroup } from '@headlessui/react';

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
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [allExpanded, setAllExpanded] = useState(false);
  const [showAllInputs, setShowAllInputs] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Focus
  const [selection, setSelection] = useState<Selection | null>(null);

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
  const allLevels = useMemo(() => buildHierarchy(inputList), [inputList]);

  const levels = useMemo(
    () =>
      buildHierarchy(
        inputList,
        (slide) => showAllInputs || Section.shouldShow(slide.input_elements, inputs)
      ),
    [inputList, showAllInputs, inputs]
  );

  const groupedForState = useMemo(() => groupedByName(levels), [levels]);

  const toggleKey = (key: string) =>
    setExpandedKeys((keys) =>
      keys.includes(key) ? keys.filter((each) => each !== key) : [...keys, key]
    );

  // Update the URL with the current state
  const updateUrlWithState = () => {
      const [categories, subCategories, sections] = keysByLevel(expandedKeys);

      const stateString = serializeTableState(
        sections,
        subCategories,
        categories,
        groupedForState,
        showAllInputs
      );

      const url = new URL(window.location.href);
      url.searchParams.set('state', stateString);
      window.history.replaceState(null, '', url.toString());
    };

  // Effect to update URL when expanded sections change
  useEffect(() => {
    if (hasMounted) {
      updateUrlWithState();
    } else {
      setHasMounted(true);
    }
  }, [expandedKeys, showAllInputs]);

  // Effect to restore state from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stateString = params.get('state');

    if (stateString) {
      const { expandedMainCategories, expandedSubCategories, expandedSections, showAllInputs } =
        parseTableState(stateString, groupedForState);
      setExpandedKeys([...expandedMainCategories, ...expandedSubCategories, ...expandedSections]);
      setShowAllInputs(showAllInputs);
    }
  }, [inputList]);

  // Toggle between showing all inputs and modified inputs only
  const toggleShowAllInputs = () => {
    setShowAllInputs(prevState => !prevState);
  };

  const expandAll = (shouldExpand: boolean) => {
    setAllExpanded(shouldExpand);
    setExpandedKeys(shouldExpand ? allKeys(allLevels) : []);
  };

  const translate = useTranslate()

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
      <div className='flex'>
      <span className='text-xl font-medium'>{ translate('inputs.compare') }</span>
      {/* Button to toggle showing all inputs */}
      <RadioGroup
        value={ showAllInputs ? 'all' : 'mod' }
        onChange={toggleShowAllInputs}
        className="mb-5 mr-3 ml-auto flex select-none items-center gap-1 rounded-md p-1 text-sm font-medium bg-gray-100"
      >
        <RadioGroup.Label className="sr-only"></RadioGroup.Label>
        <RadioGroup.Option value="mod">
         {({ checked }) => <Option checked={checked} disabled={ false }>{ translate('inputs.modified') }</Option>}
        </RadioGroup.Option>
        <RadioGroup.Option value="all">
         {({ checked }) => <Option checked={checked} disabled={ false }>{ translate('inputs.all') }</Option>}
        </RadioGroup.Option>
      </RadioGroup>
      {/* Button to expand/collapse all categories, subcategories, and sections */}
      <button
        onClick={() => expandAll(!allExpanded)}
        className='mb-5 items-center text-sm px-2 py-1 rounded bg-midnight-500 bg-gradient-to-b from-white/20 to-transparent text-white shadow transition hover:bg-midnight-600 active:bg-midnight-700 active:shadow-inner'
      >
        {allExpanded ? translate('inputs.collapse') : translate('inputs.expand')}
      </button>
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
          {levels.map((level) => (
            <HierarchyLevel
              key={level.key}
              node={level}
              expandedKeys={expandedKeys}
              onToggle={toggleKey}
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
