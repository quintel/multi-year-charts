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

  const createSubAccordionItems = (definitions: InputData) => {
    return definitions.map((definition) => {
      const itemKey = definition.path.join('/');
      return {
        title: definition.path[2],
        content: Section.shouldShow(definition.input_elements, inputs) ? (
          <Section
            key={itemKey}
            slide={definition}
            inputData={inputs}
            scenarioIDs={scenarioIDs}
            onInputClick={openModal}
          />
        ) : null,
        isOpen: openItems.includes(itemKey),
        onToggle: () => onToggleItem(itemKey),
      };
    });
  };

  const createAccordionItems = (groupedDefs: { [key: string]: InputData }) => {
    return Object.keys(groupedDefs).map((subGroupKey) => {
      const itemKey = subGroupKey;
      return {
        title: subGroupKey,
        content: <Accordion items={createSubAccordionItems(groupedDefs[subGroupKey])} />,
        isOpen: openItems.includes(itemKey),
        onToggle: () => onToggleItem(itemKey),
      };
    });
  };

  const mainAccordionItems = Object.keys(groupedDefinitions).map((groupKey) => {
    const itemKey = groupKey;
    return {
      title: groupKey,
      content: <Accordion items={createAccordionItems(groupedDefinitions[groupKey])} />,
      isOpen: openItems.includes(itemKey),
      onToggle: () => onToggleItem(itemKey),
    };
  });

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

  // Helper function to get the open items from the URL
  const getOpenItemsFromURL = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const openItems = params.get('openItems');
    return openItems ? openItems.split(',') : [];
  }, []);

  // Initialize state
  const [openItems, setOpenItems] = useState<string[]>(getOpenItemsFromURL);

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

const mapStateToProps = (state: AppState) => ({
  inputData: state.inputData,
  scenarioData: state.scenarioData,
});

export default connect(mapStateToProps, { apiFetch, fetchInputs })(InputsSummary);
