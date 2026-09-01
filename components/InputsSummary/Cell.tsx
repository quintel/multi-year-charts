import { useEffect, useState } from 'react';

import { InputData, InputValue } from '../../utils/api/types';
import { coerceValue } from '../../utils/inputs/coerce';
import { controlTypeFor, formatInputValue } from '../../utils/inputs/vocabulary';

interface CellProps {
  input: InputData;
  onCommit: (value: InputValue) => void;
  translate: (id: string) => string;
  value: InputValue;
}

const controlClasses =
  'w-full rounded border border-gray-300 bg-white px-1 py-0.5 text-right text-midnight-900 ' +
  'focus:border-midnight-500 focus:outline-none';

/** A number the user types. */
function NumericCell({ input, onCommit, value }: CellProps) {
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

    // An unchanged value is not worth a request.
    if (coerced !== value) onCommit(coerced);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      className={controlClasses}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
    />
  );
}

function BooleanCell({ onCommit, value }: CellProps) {
  return (
    <input
      type="checkbox"
      className="align-middle accent-midnight-600"
      checked={Boolean(value)}
      onChange={(event) => onCommit(event.target.checked ? 1 : 0)}
    />
  );
}

/** An enum offers its permitted values, or its own value when the payload omits them. */
function EnumCell({ input, onCommit, translate, value }: CellProps) {
  if (!input.permitted_values?.length) {
    return <>{formatInputValue(value, input.unit, translate)}</>;
  }

  return (
    <select
      className={controlClasses}
      value={String(value)}
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

/**
 * One input's value in one column, as a control chosen from ETEngine's unit.
 */
export default function Cell(props: CellProps) {
  switch (controlTypeFor(props.input.unit)) {
    case 'boolean':
      return <BooleanCell {...props} />;
    case 'enum':
      return <EnumCell {...props} />;
    default:
      return <NumericCell {...props} />;
  }
}
