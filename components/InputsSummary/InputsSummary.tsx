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

// Define the props for the InputsSummary component
interface InputsSummaryProps {
  apiFetch: () => void;
  fetchInputs: () => void;
  inputData: ScenarioIndexedInputData;
  scenarioData: ScenarioIndexedScenarioData;
}

// Define the type for the function to open a modal
type OpenModalFunc = (scenarioID: number, inputKey?: string) => void;

// Helper function to check if data is loaded
function isDataLoaded(
  inputData: ScenarioIndexedInputData,
  scenarioData: ScenarioIndexedScenarioData
) {
  return Object.keys(inputData).length > 0 && Object.keys(scenarioData).length > 0;
}

// Component to display a loading indicator while data is being fetched
function InputSummaryLoading() {
  return (
    <div className="flex h-[400px] items-center justify-center text-gray-500">
      <Loading />
    </div>
  );
}

// Define the props for the InputsAccordion component
interface InputsAccordionProps {
  inputList: InputData;
  inputs: InputsSummaryProps['inputData'];
  openModal: OpenModalFunc;
  scenarios: InputsSummaryProps['scenarioData'];
  openItems: string[];
  onToggleItem: (item: string) => void;
}

// Component to display the inputs in an accordion format
function InputsAccordion({ inputs, openModal, scenarios, inputList, openItems, onToggleItem }: InputsAccordionProps) {
  const sortedScenarios = sortScenarios(Object.values(scenarios));
  const scenarioIDs = sortedScenarios.map(({ scenario: { id } }) => id);
  const baseYear = sortedScenarios[0]?.scenario.startYear;
  const endYears = sortedScenarios.map(({ scenario: { endYear } }) => endYear);

  // Group the input definitions by their path for easier rendering
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

  // Helper function to create sub accordion items
  const createSubAccordionItems = (definitions: InputData, nestedLevel: number) => {
    return definitions.map((definition) => {
      const itemKey = definition.path.join('/');
      const sectionVisible = Section.shouldShow(definition.input_elements, inputs);
      return sectionVisible ? {
        title: definition.path[2],
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

  // Helper function to create accordion items
  const createAccordionItems = (groupedDefs: { [key: string]: InputData }, nestedLevel: number) => {
    return Object.keys(groupedDefs).map((subGroupKey) => {
      const itemKey = subGroupKey;
      const subItems = createSubAccordionItems(groupedDefs[subGroupKey], nestedLevel + 1);
      return subItems.length > 0 ? {
        title: subGroupKey,
        content: <Accordion items={subItems} />,
        nestedLevel,
        isOpen: openItems.includes(itemKey),
        onToggle: () => onToggleItem(itemKey),
      } : null;
    }).filter(item => item !== null);
  };

  // Create the main accordion items
  const mainAccordionItems = Object.keys(groupedDefinitions).map((groupKey) => {
    const itemKey = groupKey;
    const groupItems = createAccordionItems(groupedDefinitions[groupKey], 1);
    return groupItems.length > 0 ? {
      title: groupKey,
      content: <Accordion items={groupItems} />,
      nestedLevel: 0,
      isOpen: openItems.includes(itemKey),
      onToggle: () => onToggleItem(itemKey),
    } : null;
  }).filter(item => item !== null);

  return <Accordion items={mainAccordionItems} />;
}

// Define the state for the scenario editor
type EditorState =
  | {
      isOpen: true;
      scenarioID: number;
      inputKey: string | undefined;
    }
  | { isOpen: false };

// Define the actions for the scenario editor
type EditorAction =
  | {
      type: 'open';
      scenarioID: number;
      inputKey: string | undefined;
    }
  | { type: 'close' };

// Reducer function to manage the editor state
function reducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'open':
      return { isOpen: true, scenarioID: action.scenarioID, inputKey: action.inputKey };
    case 'close':
      return { isOpen: false };
  }
}

// Initial state for the editor
const initialState: EditorState = { isOpen: false };

// Main component to display the inputs summary
function InputsSummary({ apiFetch, fetchInputs, ...props }: InputsSummaryProps) {
  const inputList = useInputDefinitions();
  const [editorState, dispatch] = useReducer(reducer, initialState);

  // Fetch data on component mount
  useEffect(() => {
    if (Object.values(props.inputData).length === 0) {
      fetchInputs();
    }

    if (Object.values(props.scenarioData).length === 0) {
      apiFetch();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Callback to open the modal
  const openModal = useCallback(
    (scenarioID: number, inputKey?: string) => {
      dispatch({ type: 'open', scenarioID, inputKey });
    },
    [dispatch]
  );

  // Callback to close the modal
  const closeModal = useCallback(() => {
    fetchInputs();
    apiFetch();
    dispatch({ type: 'close' });
  }, [dispatch, fetchInputs, apiFetch]);

  // Helper function to get the open items from the URL
  const getOpenItemsFromURL = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const openItems = params.get('openItems');
    return openItems ? openItems.split(',') : [];
  }, []);

  // Initialize state
  const [openItems, setOpenItems] = useState<string[]>(getOpenItemsFromURL);

  // Callback to toggle an item in the accordion
  const onToggleItem = useCallback(
    (item: string) => {
      setOpenItems((prevOpenItems) => {
        const newOpenItems = prevOpenItems.includes(item)
          ? prevOpenItems.filter((i) => i !== item)
          : [...prevOpenItems, item];
        const params = new URLSearchParams(window.location.search);
        params.set('openItems', newOpenItems.join(','));
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
        return newOpenItems;
      });
    },
    []
  );

  // Update effect for open items
  useEffect(() => {
  }, [openItems]);

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

// Map state to props for the InputsSummary component
const mapStateToProps = (state: AppState) => ({
  inputData: state.inputData,
  scenarioData: state.scenarioData,
});

// Connect the component to the Redux store
export default connect(mapStateToProps, { apiFetch, fetchInputs })(InputsSummary);
