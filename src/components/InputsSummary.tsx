import React, { Component } from 'react';
import { connect } from 'react-redux';

import { AppState } from '../store/types';

import {
  ScenarioIndexedInputData,
  ScenarioIndexedScenarioData
} from '../utils/api/types';

import { fetchInputs } from '../store/actions';
import sortScenarios from '../utils/sortScenarios';
import inputDefinitions from '../data/inputs.json';

interface InputsSummaryProps {
  fetchInputs: () => {};
  inputData: ScenarioIndexedInputData;
  scenarioData: ScenarioIndexedScenarioData;
}

/**
 * A rudimentary formatter for input values.
 */
const formatInputValue = (value: number, inputDefinition: { unit: string }) => {
  const [, fraction] = value.toString().split('.');
  let precision = 0;

  if (fraction) {
    precision = Math.min(fraction.length, 2);
  }

  return `${value.toFixed(precision)}${inputDefinition.unit}`;
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
 * Links to the correct slide in ETModel for the given scenario and input,
 * allowing the user to make further changes.
 */
const urlForInput = (scenarioID: number, input: { key: string }) =>
  `${process.env.REACT_APP_ETMODEL_URL}/scenarios/${scenarioID}/reopen?input=${
    input.key
  }`;

/**
 * Returns HTML for a single row in the input summary, representing an input and
 * the values in each scenario.
 */
const renderInput = (
  input: { name: string; key: string; unit: string },
  inputData: ScenarioIndexedInputData,
  scenarioIDs: number[]
) => {
  return (
    <tr key={`input - ${input.key} `}>
      <td>{input.name}</td>
      {scenarioIDs.map(id => {
        let value = inputData[id][input.key].user;
        let className = '';

        if (value === undefined) {
          value = inputData[id][input.key].default;
          className = 'has-text-grey';
        }

        return (
          <td key={`input - val - ${id} -${input.key} `} className={className}>
            <a
              href={urlForInput(id, input)}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
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
  scenarios: number[]
) => {
  const inputs = modifiedInputs(slide.input_elements, inputData);

  if (inputs.length === 0) {
    return null;
  }

  return (
    <React.Fragment key={`slide - ${slide.path.join()} `}>
      <tr>
        <th colSpan={5}>{slide.path.join(' → ')}</th>
      </tr>
      {slide.input_elements.map(element =>
        renderInput(element, inputData, scenarios)
      )}
    </React.Fragment>
  );
};

/**
 * Shows a list of all inputs which have been modified in the loaded scenarios,
 * with links to open the scenarios allowing the user to make further
 * adjustment.
 */
class InputsSummary extends Component<InputsSummaryProps, {}> {
  render() {
    return (
      <div className="container">
        <h2>Inputs summary:</h2>
        {this.dataIsLoaded() ? this.renderInputs() : this.renderLoading()}
      </div>
    );
  }

  componentWillMount() {
    if (Object.values(this.props.inputData).length === 0) {
      this.props.fetchInputs();
    }
  }

  private dataIsLoaded() {
    return (
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
            {sortedScenarios.map(({ scenario: { endYear } }) => (
              <th key={`year - ${endYear} `}>{endYear}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {inputDefinitions.map(definition =>
            renderSlide(
              definition,
              this.props.inputData,
              sortedScenarios.map(({ scenario: { id } }) => id)
            )
          )}
        </tbody>
      </table>
    );
  }

  private renderLoading() {
    return <progress className="progress is-info is-primary" max="100" />;
  }
}

const mapStateToProps = (state: AppState) => ({
  inputData: state.inputData,
  scenarioData: state.scenarioData
});

export default connect(
  mapStateToProps,
  { fetchInputs }
)(InputsSummary);
