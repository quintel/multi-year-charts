import { useEffect, useState } from 'react';
import { RefreshIcon } from '@heroicons/react/solid';

import { InputData, InputValue } from '../../utils/api/types';
import { CellFlags, chromeClass, toneClass } from '../../utils/inputs/appearance';
import { coerceValue } from '../../utils/inputs/coerce';
import { controlTypeFor, formatInputValue } from '../../utils/inputs/vocabulary';

interface CellProps extends CellFlags {
  input: InputData;
  isSet: boolean;
  onCommit: (value: InputValue) => void;
  onReset: () => void;
  onSelect: () => void;
  pending: boolean;
  refusal?: string;
  translate: (id: string) => string;
  value: InputValue;
}

const controlClasses = (isSet: boolean, flags: CellFlags) =>
  'w-full rounded border bg-transparent px-1 py-0.5 text-right ' +
  'focus:border-midnight-500 focus:bg-white focus:outline-none ' +
  `${toneClass(true, isSet)} ${chromeClass(flags)}`;

function NumericCell({ input, isSet, onCommit, onSelect, refusal, value, ...flags }: CellProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const typed = parseFloat(draft);

    if (isNaN(typed)) {
      setDraft(String(value));
      return;
    }

    const coerced = coerceValue(typed, input);

    setDraft(String(coerced));

    if (coerced !== value) onCommit(coerced);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      className={controlClasses(isSet, flags)}
      title={refusal}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={onSelect}
      onBlur={commit}
      onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
    />
  );
}

function BooleanCell({ onCommit, onSelect, value }: CellProps) {
  return (
    <input
      type="checkbox"
      className="align-middle accent-midnight-600"
      checked={Boolean(value)}
      onFocus={onSelect}
      onChange={(event) => onCommit(event.target.checked ? 1 : 0)}
    />
  );
}

/** An enum offers its permitted values, or its own value when the payload omits them. */
function EnumCell({ input, isSet, onCommit, onSelect, translate, value, ...flags }: CellProps) {
  if (!input.permitted_values?.length) {
    return (
      <span className={toneClass(true, isSet)}>
        {formatInputValue(value, input.unit, translate)}
      </span>
    );
  }

  return (
    <select
      className={`${controlClasses(isSet, flags)} appearance-none`}
      value={String(value)}
      onFocus={onSelect}
      onChange={(event) => onCommit(event.target.value)}
    >
      {input.permitted_values.map((permitted) => (
        <option key={permitted} value={permitted}>
          {permitted}
        </option>
      ))}
    </select>
  );
}

const control = (props: CellProps) => {
  switch (controlTypeFor(props.input.unit)) {
    case 'boolean':
      return <BooleanCell {...props} />;
    case 'enum':
      return <EnumCell {...props} />;
    default:
      return <NumericCell {...props} />;
  }
};

/**
 * Returns the cell to the value its session inherited
 */
function ResetButton({ input, onReset, onSelect, translate }: CellProps) {
  const label = input.share_group ? translate('inputs.resetGroup') : translate('inputs.reset');

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="absolute inset-y-0 left-0 flex items-center px-1 text-gray-400 opacity-0
        transition hover:text-gray-700 focus:opacity-100 focus:outline-none group-hover:opacity-100"
      onClick={onReset}
      onFocus={onSelect}
      onMouseEnter={onSelect}
    >
      <RefreshIcon className="h-3.5 w-3.5" />
    </button>
  );
}

export default function Cell(props: CellProps) {
  return (
    <div className={`group relative ${props.pending ? 'opacity-50' : ''}`}>
      {control(props)}
      {props.isSet ? <ResetButton {...props} /> : null}
    </div>
  );
}
