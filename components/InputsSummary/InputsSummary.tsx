import { useCallback, useEffect, useReducer, useState } from 'react';
import { connect } from 'react-redux';
import Section from './Section';
import Loading from '../Loading';
import ScenarioEditor from '../ScenarioEditor';
import { AppState } from '../../store/types';
import { ScenarioIndexedInputData, ScenarioIndexedScenarioData } from '../../utils/api/types';
import { apiFetch, fetchInputs } from '../../store/actions';
import sortScenarios from '../../utils/sortScenarios';
import useInputDefinitions, { InputData } from '../../utils/etmodel/useInputDefinitions';
import Accordion from './Accordion';

interface InputsSummaryProps {
  apiFetch: () => void;
  fetchInputs: () => void;
  inputData: ScenarioIndexedInputData;
  scenarioData: ScenarioIndexedScenarioData;
}

type OpenModalFunc = (scenarioID: number, inputKey?: string) => void;

function isDataLoaded(
  inputData: ScenarioIndexedInputData,
  scenarioData: ScenarioIndexedScenarioData
) {
  return Object.keys(inputData).length > 0 && Object.keys(scenarioData).length > 0;
}

function InputSummaryLoading() {
  return (
    <div className="flex h-[400px] items-center justify-center text-gray-500">
      <Loading />
    </div>
  );
}

interface InputsAccordionProps {
  inputList: InputData;
  inputs: InputsSummaryProps['inputData'];
  openModal: OpenModalFunc;
  scenarios: InputsSummaryProps['scenarioData'];
  openItems: string[];
  onToggleItem: (item: string) => void;
}

function InputsAccordion({ inputs, openModal, scenarios, inputList, openItems, onToggleItem }: InputsAccordionProps) {
  const sortedScenarios = sortScenarios(Object.values(scenarios));
  const scenarioIDs = sortedScenarios.map(({ scenario: { id } }) => id);
  const baseYear = sortedScenarios[0]?.scenario.startYear;
  const endYears = sortedScenarios.map(({ scenario: { endYear } }) => endYear);

  const groupedDefinitions = inputList.reduce((acc, definition) => {
    const groupKey = definition.path[0];
    const subGroupKey = definition.path[1];
    if (!acc[groupKey]) {
      acc[groupKey] = {};
    }
    if (!acc[groupKey][subGroupKey]) {
      acc[groupKey][subGroupKey] = [];
    }
    acc[groupKey][subGroupKey].push(definition);
    return acc;
  }, {} as { [key: string]: { [key: string]: InputData } });

  const createSubAccordionItems = (definitions: InputData, nestedLevel: number) => {
    return definitions.map((definition) => {
      const itemKey = definition.path.join('/');
      const sectionVisible = Section.shouldShow(definition.input_elements, inputs);
      const hashLink = `${window.location.pathname}#${itemKey}`;

      const titleWithButton = (
        <div className="flex items-center">
          <span>{definition.path[2]}</span>
          <button
            className="ml-2 text-blue-500 hover:text-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              const hashLink = `${window.location.origin}${window.location.pathname}#${itemKey}`;
              navigator.clipboard.writeText(hashLink).then(() => {
                alert('URL copied to clipboard!');
              });
            }}
          >
            #
          </button>
        </div>
      );

      return sectionVisible ? {
        title: titleWithButton,
        content: (
          <div key={itemKey}>
            <Section
              key={itemKey}
              slide={definition}
              inputData={inputs}
              scenarioIDs={scenarioIDs}
              years={[baseYear, ...endYears]}
              onInputClick={openModal}
            />
          </div>
        ),
        nestedLevel,
        isOpen: openItems.includes(itemKey),
        onToggle: () => onToggleItem(itemKey),
      } : null;
    }).filter(item => item !== null);
  };

  const createAccordionItems = (groupedDefs: { [key: string]: InputData }, nestedLevel: number) => {
    return Object.keys(groupedDefs).map((subGroupKey) => {
      const itemKey = subGroupKey;
      const subItems = createSubAccordionItems(groupedDefs[subGroupKey], nestedLevel + 1);

      const titleWithButton = (
        <div className="flex items-center">
          <span>{subGroupKey}</span>
          <button
            className="ml-2 text-blue-500 hover:text-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              const hashLink = `${window.location.origin}${window.location.pathname}#${itemKey}`;
              navigator.clipboard.writeText(hashLink).then(() => {
                alert('URL copied to clipboard!');
              });
            }}
          >
            #
          </button>
        </div>
      );

      return subItems.length > 0 ? {
        title: titleWithButton,
        content: <Accordion items={subItems} />,
        nestedLevel,
        isOpen: openItems.includes(itemKey),
        onToggle: () => onToggleItem(itemKey),
      } : null;
    }).filter(item => item !== null);
  };

  const mainAccordionItems = Object.keys(groupedDefinitions).map((groupKey) => {
    const itemKey = groupKey;
    const groupItems = createAccordionItems(groupedDefinitions[groupKey], 1);

    const titleWithButton = (
      <div className="flex items-center">
        <span>{groupKey}</span>
        <button
          className="ml-2 text-blue-500 hover:text-blue-700"
          onClick={(e) => {
            e.stopPropagation();
            const hashLink = `${window.location.origin}${window.location.pathname}#${itemKey}`;
            navigator.clipboard.writeText(hashLink).then(() => {
              alert('URL copied to clipboard!');
            });
          }}
        >
          #
        </button>
      </div>
    );

    return groupItems.length > 0 ? {
      title: titleWithButton,
      content: <Accordion items={groupItems} />,
      nestedLevel: 0,
      isOpen: openItems.includes(itemKey),
      onToggle: () => onToggleItem(itemKey),
    } : null;
  }).filter(item => item !== null);

  return <Accordion items={mainAccordionItems} />;
}

type EditorState =
  | {
      isOpen: true;
      scenarioID: number;
      inputKey: string | undefined;
    }
  | { isOpen: false };

type EditorAction =
  | {
      type: 'open';
      scenarioID: number;
      inputKey: string | undefined;
    }
  | { type: 'close' };

function reducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'open':
      return { isOpen: true, scenarioID: action.scenarioID, inputKey: action.inputKey };
    case 'close':
      return { isOpen: false };
  }
}

const initialState: EditorState = { isOpen: false };

function InputsSummary({ apiFetch, fetchInputs, ...props }: InputsSummaryProps) {
  const inputList = useInputDefinitions();
  const [editorState, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (Object.values(props.inputData).length === 0) {
      fetchInputs();
    }

    if (Object.values(props.scenarioData).length === 0) {
      apiFetch();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openModal = useCallback(
    (scenarioID: number, inputKey?: string) => {
      dispatch({ type: 'open', scenarioID, inputKey });
    },
    [dispatch]
  );

  const closeModal = useCallback(() => {
    fetchInputs();
    apiFetch();
    dispatch({ type: 'close' });
  }, [dispatch, fetchInputs, apiFetch]);

  const getOpenItemsFromURL = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const openItems = params.get('openItems');
    return openItems ? openItems.split(',') : [];
  }, []);

  const [openItems, setOpenItems] = useState<string[]>(getOpenItemsFromURL);

  const onToggleItem = useCallback(
    (item: string) => {
      setOpenItems((prevOpenItems) => {
        const newOpenItems = prevOpenItems.includes(item)
          ? prevOpenItems.filter((i) => i !== item)
          : [...prevOpenItems, item];
        return newOpenItems;
      });
    },
    []
  );

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const hashParts = hash.split('/');
      const recursiveOpenItems = [];

      // Recursively construct the path and open all relevant accordion items
      for (let i = 1; i <= hashParts.length; i++) {
        const part = hashParts.slice(0, i).join('/');
        recursiveOpenItems.push(part);
      }

      console.log("Recursive Open Items:", recursiveOpenItems); // Debugging

      // Set open items without causing an infinite loop
      setOpenItems(recursiveOpenItems);

      // Ensure the deepest nested accordion is opened and scroll to it
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 300); // Delay to ensure all levels are open before scrolling
      }
    }
  }, []); // Empty dependency array to ensure this runs only on mount



  return (
    <div className="container">
      {inputList && isDataLoaded(props.inputData, props.scenarioData) ? (
        <InputsAccordion
          inputs={props.inputData}
          scenarios={props.scenarioData}
          openModal={openModal}
          inputList={inputList}
          openItems={openItems}
          onToggleItem={onToggleItem}
        />
      ) : (
        <InputSummaryLoading />
      )}
      {editorState.isOpen ? (
        <ScenarioEditor
          endYear={props.scenarioData[editorState.scenarioID].scenario.endYear}
          onClose={closeModal}
          {...editorState}
        />
      ) : null}
    </div>
  );
}

const mapStateToProps = (state: AppState) => ({
  inputData: state.inputData,
  scenarioData: state.scenarioData,
});

export default connect(mapStateToProps, { apiFetch, fetchInputs })(InputsSummary);
