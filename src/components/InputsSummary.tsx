import React, { Component } from 'react';
import { connect } from 'react-redux';

import ScenarioEditor from './ScenarioEditor';
import { AppState } from '../store/types';

import {
  ScenarioIndexedInputData,
  ScenarioIndexedScenarioData
} from '../utils/api/types';

import { apiFetch, fetchInputs } from '../store/actions';
import sortScenarios from '../utils/sortScenarios';
import inputDefinitions from '../data/inputs.json';

interface InputsSummaryProps {
  apiFetch: () => void;
  fetchInputs: () => void;
  inputData: ScenarioIndexedInputData;
  scenarioData: ScenarioIndexedScenarioData;
}

interface InputsSummaryState {
  // When the editor settings are present, they describe the scenario ID and
  // input key which should be opened in the modal.
  editorSettings: { isOpen: boolean; scenarioID?: number; inputKey?: string };
}

type OpenModalFunc = (scenarioID: number, inputKey: string) => void;

/**
 * A rudimentary formatter for input values.
 */
const formatInputValue = (value: number, inputDefinition: { unit: string }) => {
  const [, fraction] = value.toString().split('.');
  let precision = 0;
  let { unit } = inputDefinition;

  if (fraction) {
    precision = Math.min(fraction.length, 2);
  }

  if (unit === '#') {
    unit = '';
  }

  return (
    <React.Fragment>
      {value.toFixed(precision)} <small>{unit}</small>
    </React.Fragment>
  );
};

/**
 * Given a slide, returns a list of input definitions representing inputs for
 * which the scenario creator has specified a custom value.
 *
 * @todo If the inputs belong to share group, the whole group must be returned
 *       even when values have not been changed.
 */
const modifiedInputs = (
  inputElements: { key: string }[],
  inputData: ScenarioIndexedInputData
) => {
  return inputElements.filter(definition => {
    return Object.values(inputData).some(byScenario => {
      return (
        byScenario[definition.key] &&
        byScenario[definition.key].hasOwnProperty('user')
      );
    });
  });
};

/**
 * Returns HTML for a single row in the input summary, representing an input and
 * the values in each scenario.
 */
const renderInput = (
  input: { name: string; key: string; unit: string },
  inputData: ScenarioIndexedInputData,
  scenarioIDs: number[],
  onClick: OpenModalFunc
) => {
  return (
    <tr key={`input-${input.key} `}>
      <td>{input.name}</td>
      <td key={`input-val-present-${input.key}`} className="start-year">
        {formatInputValue(inputData[scenarioIDs[0]][input.key].default, input)}
      </td>

      {scenarioIDs.map(id => {
        let value = inputData[id][input.key].user;
        let className = '';

        if (value === undefined) {
          value = inputData[id][input.key].default;
          className = 'has-text-grey';
        }

        return (
          <td key={`input-val-${id}-${input.key}`}>
            <a onClick={() => onClick(id, input.key)} className={className}>
              {formatInputValue(value, input)}
            </a>
          </td>
        );
      })}
    </tr>
  );
};

/**
 * Returns HTML for an ETM slide, showing the title of the slide and the value
 * of all inputs belonging to it for each scenario.
 */
const renderSlide = (
  slide: {
    path: string[];
    input_elements: { name: string; key: string; unit: string }[];
  },
  inputData: ScenarioIndexedInputData,
  scenarios: number[],
  onClick: OpenModalFunc
) => {
  const inputs = modifiedInputs(slide.input_elements, inputData);

  if (inputs.length === 0) {
    return null;
  }

  return (
    <React.Fragment key={`slide-${slide.path.join()} `}>
      <tr>
        <th colSpan={6}>{slide.path.join(' → ')}</th>
      </tr>
      {slide.input_elements.map(element =>
        renderInput(element, inputData, scenarios, onClick)
      )}
    </React.Fragment>
  );
};

/**
 * Shows a list of all inputs which have been modified in the loaded scenarios,
 * with links to open the scenarios allowing the user to make further
 * adjustment.
 */
class InputsSummary extends Component<InputsSummaryProps, InputsSummaryState> {
  state = { editorSettings: { isOpen: false, scenarioID: 0, inputKey: '' } };

  constructor(props: InputsSummaryProps) {
    super(props);

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  render() {
    return (
      <div className="container">
        {this.dataIsLoaded() ? this.renderInputs() : this.renderLoading()}
        {this.state.editorSettings.isOpen ? (
          <ScenarioEditor {...this.scenarioEditorProps()} />
        ) : null}
      </div>
    );
  }

  componentWillMount() {
    if (Object.values(this.props.inputData).length === 0) {
      this.props.fetchInputs();
    }

    if (Object.values(this.props.scenarioData).length === 0) {
      this.props.apiFetch();
    }
  }

  /**
   * Determines if all the data needed to show the InputSummary has been loaded.
   */
  private dataIsLoaded() {
    return !!(
      Object.keys(this.props.inputData).length &&
      Object.keys(this.props.scenarioData).length
    );
  }

  private renderInputs() {
    const sortedScenarios = sortScenarios(
      Object.values(this.props.scenarioData)
    );

    return (
      <table className="table is-fullwidth">
        <thead>
          <tr>
            <th>Input</th>
            <th>{sortedScenarios[0].scenario.startYear}</th>
            {sortedScenarios.map(({ scenario: { endYear } }) => (
              <th key={`year-${endYear} `}>{endYear}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {inputDefinitions.map(definition =>
            renderSlide(
              definition,
              this.props.inputData,
              sortedScenarios.map(({ scenario: { id } }) => id),
              this.openModal
            )
          )}
        </tbody>
      </table>
    );
  }

  private renderLoading() {
    return <progress className="progress is-info is-primary" max="100" />;
  }

  /**
   * Returns props for the ScenarioEditor modal.
   */
  private scenarioEditorProps() {
    return {
      ...this.state.editorSettings,
      endYear: this.props.scenarioData[this.state.editorSettings.scenarioID]
        .scenario.endYear,
      onClose: this.closeModal
    };
  }

  private openModal(scenarioID: number, inputKey: string) {
    this.setState({ editorSettings: { isOpen: true, scenarioID, inputKey } });
  }

  private closeModal() {
    this.props.fetchInputs();
    this.props.apiFetch();

    this.setState({
      editorSettings: { isOpen: false, scenarioID: 0, inputKey: '' }
    });
  }
}

const mapStateToProps = (state: AppState) => ({
  inputData: state.inputData,
  scenarioData: state.scenarioData
});

export default connect(
  mapStateToProps,
  { apiFetch, fetchInputs }
)(InputsSummary);
