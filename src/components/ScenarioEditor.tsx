import React from 'react';
import AriaModal from 'react-aria-modal';

import translate from '../utils/translate';
import translations from '../data/locales/nl.json';

interface ScenarioEditorProps {
  endYear: number;
  inputKey: string;
  onClose: () => void;
  scenarioID: number;
}

/**
 * Retrieves the root application node, needed by AriaModal.
 */
const getApplicationNode = () =>
  // We know the element definitely exists.
  document.getElementById('root') as HTMLElement;

/**
 * Links to the correct slide in ETModel for the given scenario and input,
 * allowing the user to make further changes.
 */
const urlForInput = (scenarioID: number, inputKey: string) =>
  `${
    process.env.REACT_APP_ETMODEL_URL
  }/scenario/myc/${scenarioID}?input=${inputKey}`;

const ScenarioEditor = (props: ScenarioEditorProps) => {
  return (
    <AriaModal
      onExit={props.onClose}
      getApplicationNode={getApplicationNode}
      titleText="Scenario Editor"
    >
      <div className="scenario-editor">
        <header>
          <h2 className="title is-6">
            {translate('scenarioEditor.title', translations, {
              year: props.endYear.toString()
            })}
          </h2>
        </header>
        <iframe src={urlForInput(props.scenarioID, props.inputKey)} />
        <footer>
          <button className="button is-info" onClick={props.onClose}>
            {translate('scenarioEditor.finish', translations)}
          </button>
        </footer>
      </div>
    </AriaModal>
  );
};

export default ScenarioEditor;
