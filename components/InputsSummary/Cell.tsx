import { useEffect, useState } from 'react';

import { InputData, InputValue } from '../../utils/api/types';
import { chromeClass, toneClass } from '../../utils/inputs/appearance';
import { coerceValue } from '../../utils/inputs/coerce';
import { controlTypeFor, formatInputValue } from '../../utils/inputs/vocabulary';

interface CellProps {
  input: InputData;
  isSet: boolean;
  onCommit: (value: InputValue) => void;
  onSelect: () => void;
  pending: boolean;
  selected: boolean;
  translate: (id: string) => string;
  /** Rounded to the input's step by the row, so committing an untouched cell makes no change */
  value: InputValue;
}

const controlClasses = (isSet: boolean, selected: boolean) =>
  'w-full rounded border bg-transparent px-1 py-0.5 text-right ' +
  'focus:border-midnight-500 focus:bg-white focus:outline-none ' +
  `${toneClass(true, isSet)} ${chromeClass(selected)}`;

/** A number the user types */
function NumericCell({ input, isSet, onCommit, onSelect, selected, value }: CellProps) {
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
      className={controlClasses(isSet, selected)}
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
function EnumCell({ input, isSet, onCommit, onSelect, selected, translate, value }: CellProps) {
  if (!input.permitted_values?.length) {
    return (
      <span className={toneClass(true, isSet)}>
        {formatInputValue(value, input.unit, translate)}
      </span>
    );
  }

  return (
    <select
      className={`${controlClasses(isSet, selected)} appearance-none`}
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

export default function Cell(props: CellProps) {
  return <div className={props.pending ? 'opacity-50' : ''}>{control(props)}</div>;
}
