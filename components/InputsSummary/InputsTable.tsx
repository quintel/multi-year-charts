import React, { useState, useEffect } from 'react';
import Section from './Section';
import { ScenarioIndexedInputData, ScenarioIndexedScenarioData } from '../../utils/api/types';
import sortScenarios from '../../utils/sortScenarios';
import useTranslate from '../../utils/useTranslate';
import { serializeTableState, parseTableState} from '../../utils/tableState';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/solid';

interface InputsTableProps {
  inputs: ScenarioIndexedInputData;
  scenarios: ScenarioIndexedScenarioData;
  inputList: Array<{ path: string[]; input_elements: any[] }>;
  openModal: (scenarioID: number, inputKey?: string) => void;
}

const InputsTable: React.FC<InputsTableProps> = ({ inputs, scenarios, inputList, openModal }) => {
  // State for tracking expanded categories, subcategories, and sections
  const [expandedMainCategories, setExpandedMainCategories] = useState<string[]>([]);
  const [expandedSubCategories, setExpandedSubCategories] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [allExpanded, setAllExpanded] = useState(false);
  const [showAllInputs, setShowAllInputs] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Sort scenarios and extract necessary data
  const sortedScenarios = sortScenarios(Object.values(scenarios));
  const scenarioYears = [sortedScenarios[0].scenario.startYear, ...sortedScenarios.map(({ scenario }) => scenario.endYear)];
  const scenarioIDs = sortedScenarios.map(({ scenario: { id } }) => id);

  // Update the URL with the current state
  const updateUrlWithState = () => {
      const stateString = serializeTableState(
        expandedSections,
        expandedSubCategories,
        expandedMainCategories,
        filteredGroupedInputList,
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
  }, [expandedMainCategories, expandedSubCategories, expandedSections, showAllInputs]);

  // Effect to restore state from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stateString = params.get('state');

    if (stateString) {
      const { expandedMainCategories, expandedSubCategories, expandedSections, showAllInputs } =
        parseTableState(stateString, filteredGroupedInputList);
      setExpandedMainCategories(expandedMainCategories);
      setExpandedSubCategories(expandedSubCategories);
      setExpandedSections(expandedSections);
      setShowAllInputs(showAllInputs);
    }
  }, [inputList]);

  // Toggle main category expansion
  const toggleMainCategory = (category: string) => {
    setExpandedMainCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // Toggle subcategory expansion
  const toggleSubCategory = (category: string, subCategory: string) => {
    const key = `${category} → ${subCategory}`;
    setExpandedSubCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  // Toggle section expansion
  const toggleSection = (path: string) => {
    setExpandedSections((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  // Toggle between showing all inputs and modified inputs only
  const toggleShowAllInputs = () => {
    setShowAllInputs(prevState => !prevState);
  };

  const iconFor = (expanded: boolean) => {
    const Icon = expanded ? ChevronDownIcon : ChevronRightIcon;
    return <Icon className="ml-0.5 -mr-1 inline-block h-5 w-5 align-middle" />;
  };

  // Group input list by category and subcategory
  const groupedInputList = inputList.reduce((acc, definition) => {
    const category = definition.path[0];
    const subCategory = definition.path[1];
    if (!acc[category]) {
      acc[category] = {};
    }
    if (!acc[category][subCategory]) {
      acc[category][subCategory] = [];
    }
    acc[category][subCategory].push(definition);
    return acc;
  }, {} as Record<string, Record<string, Array<{ path: string[]; input_elements: any[] }>>>);

  // Filter grouped input list based on whether all inputs or only modified inputs should be shown
  const filteredGroupedInputList = Object.keys(groupedInputList).reduce((acc, category) => {
    const filteredSubCategories = Object.keys(groupedInputList[category]).reduce((subAcc, subCategory) => {
      const filteredSections = showAllInputs
        ? groupedInputList[category][subCategory]
        : groupedInputList[category][subCategory].filter((definition) =>
            Section.shouldShow(definition.input_elements, inputs)
          );

      if (filteredSections.length > 0) {
        subAcc[subCategory] = filteredSections;
      }

      return subAcc;
    }, {} as Record<string, Array<{ path: string[]; input_elements: any[] }>>);

    if (Object.keys(filteredSubCategories).length > 0) {
      acc[category] = filteredSubCategories;
    }

    return acc;
  }, {} as Record<string, Record<string, Array<{ path: string[]; input_elements: any[] }>>>);

  const renderHTML = (text: string) => {
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  const translate = useTranslate()

  // Dynamic width for first column (Ensure possible widths are in tailwind.config.js safelist: 36%, 44%, 52%, 60%, 68%, 76%)
  const inputColWidth = 100 - (sortedScenarios.length + 2) * 8;

  return (
    <>
      <div className='flex'>
      <span className='text-xl font-medium'>{ translate('inputs.compare') }</span>
      {/* Button to toggle showing all inputs */}
      <button onClick={toggleShowAllInputs} className='mb-5 mr-3 ml-auto items-center text-sm px-2 py-1 rounded bg-midnight-500 bg-gradient-to-b from-white/20 to-transparent text-white shadow transition hover:bg-midnight-600 active:bg-midnight-700 active:shadow-inner'>
        {showAllInputs ? translate('inputs.modified') : translate('inputs.all')}
      </button>
      {/* Button to expand/collapse all categories, subcategories, and sections */}
      <button
        onClick={() => {
          const shouldExpand = !allExpanded;
          setAllExpanded(shouldExpand);
          if (shouldExpand) {
            setExpandedMainCategories(Object.keys(groupedInputList));
            setExpandedSubCategories(
              Object.keys(groupedInputList).flatMap((category) =>
                Object.keys(groupedInputList[category]).map(
                  (subCategory) => `${category} → ${subCategory}`
                )
              )
            );
            setExpandedSections(
              inputList.map((definition) => definition.path.join(' → '))
            );
          } else {
            setExpandedMainCategories([]);
            setExpandedSubCategories([]);
            setExpandedSections([]);
          }
        }}
        className='mb-5 items-center text-sm px-2 py-1 rounded bg-midnight-500 bg-gradient-to-b from-white/20 to-transparent text-white shadow transition hover:bg-midnight-600 active:bg-midnight-700 active:shadow-inner'
      >
        {allExpanded ? translate('inputs.collapse') : translate('inputs.expand')}
      </button>
      </div>

      {/* Table structure to display the inputs */}
      <table className="w-full text-sm">
        <thead>
          <tr className='border-b-2 border-b-gray-300'>
            <th className={`p-2 text-left font-semibold w-[${inputColWidth}%]`}>Category/Input</th>
            <th className="p-2 text-right font-semibold w-[8%]">{translate('inputs.unit')}</th>
            <th className="w-[12%] p-2 text-right font-semibold">
              {sortedScenarios[0].scenario.startYear}
            </th>
            {sortedScenarios.map(({ scenario: { id, endYear } }) => (
              <th key={`year-${endYear}-${id}`} className="w-[8%] p-2 text-right">
                <button
                  onClick={() => openModal(id)}
                  className="-my-1 -mx-2 cursor-pointer rounded py-1 px-2 text-midnight-700 hover:bg-gray-100 hover:text-midnight-900 active:bg-gray-200 active:text-midnight-900"
                >
                  {endYear}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(filteredGroupedInputList).map((category) => {
            const isCategoryExpanded = expandedMainCategories.includes(category);

            return (
              <React.Fragment key={category}>
                {/* Render main category row */}
                <tr className={`cursor-pointer border-b border-b-gray-300`} onClick={() => toggleMainCategory(category)}>
                  <th className={`p-2 text-left font-semibold`}>
                    {renderHTML(category)} {iconFor(isCategoryExpanded)}
                  </th>
                  <th colSpan={scenarioYears.length + 2}></th>
                </tr>
                {isCategoryExpanded && Object.keys(filteredGroupedInputList[category]).map((subCategory) => {
                  const isSubCategoryExpanded = expandedSubCategories.includes(`${category} → ${subCategory}`);

                  return (
                    <React.Fragment key={`${category} → ${subCategory}`}>
                      {/* Render subcategory row */}
                      <tr className={`cursor-pointer border-b border-b-gray-300`} onClick={() => toggleSubCategory(category, subCategory)}>
                        <th className={`p-2 pl-8 text-left font-semibold text-gray-600`}>{renderHTML(subCategory)} {iconFor(isSubCategoryExpanded)}</th>
                        <td colSpan={scenarioYears.length}></td>
                      </tr>
                      {isSubCategoryExpanded && filteredGroupedInputList[category][subCategory].map((definition) => {
                        const path = definition.path.join(' → ');
                        const isSectionExpanded = expandedSections.includes(path);

                        return (
                          <React.Fragment key={definition.path.join('/')}>
                            {/* Render section row */}
                            <tr className={`cursor-pointer border-b border-b-gray-300 bg-gray-100`} onClick={() => toggleSection(path)}>
                              <th className='p-2 pl-8 text-left font-normal text-gray-600'>{renderHTML(definition.path.slice(2).join(' → '))} {iconFor(isSectionExpanded)}</th>
                              <td colSpan={scenarioYears.length + 1}></td>
                            </tr>
                            {isSectionExpanded && (
                              <Section
                                slide={definition}
                                inputData={inputs}
                                scenarioIDs={scenarioIDs}
                                onInputClick={openModal}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default InputsTable;
