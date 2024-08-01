import { RadioGroup } from '@headlessui/react';
import React, { useEffect, useState } from 'react';

const optionClasses = {
  checked: 'px-2 py-1 rounded bg-midnight-500 text-white cursor-default transition',
  unchecked: 'px-2 py-1 rounded cursor-pointer text-gray-700 hover:bg-gray-200 active:bg-gray-300 active:text-gray-800 transition',
};

function Option({ checked, children }: { checked: boolean; children: React.ReactNode }) {
  return <div className={optionClasses[checked ? 'checked' : 'unchecked']}>{children}</div>;
}

function UnitToggle() {
  const [value, setValue] = useState<'J' | 'Wh'>('J');

  useEffect(() => {
    const savedUnit = localStorage.getItem('defaultUnit');
    if (savedUnit) {
      setValue(savedUnit as 'J' | 'Wh');
    }
  }, []);

  const handleChange = (newValue: 'J' | 'Wh') => {
    setValue(newValue);
    localStorage.setItem('defaultUnit', newValue);
    window.dispatchEvent(new Event('unitChange'));
  };

  return (
    <RadioGroup
      value={value}
      onChange={handleChange}
      className="-my-1 ml-2 flex select-none items-center gap-1 rounded-md bg-gray-100 p-1 text-sm font-medium"
    >
      <RadioGroup.Label className="sr-only">Set Default Unit</RadioGroup.Label>
      <RadioGroup.Option value="J">
        {({ checked }) => <Option checked={checked}>J</Option>}
      </RadioGroup.Option>
      <RadioGroup.Option value="Wh">
        {({ checked }) => <Option checked={checked}>Wh</Option>}
      </RadioGroup.Option>
    </RadioGroup>
  );
}

export default UnitToggle;
