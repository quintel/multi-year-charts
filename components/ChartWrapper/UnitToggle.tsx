import { RadioGroup } from '@headlessui/react';
import React, { useEffect, useState } from 'react';

const optionClasses = {
  checked: 'px-2 py-1 rounded bg-midnight-500 text-white cursor-default transition',
  unchecked: 'px-2 py-1 rounded cursor-pointer text-gray-700 hover:bg-gray-200 active:bg-gray-300 active:text-gray-800 transition',
};

function Option({ checked, children, disabled }: { checked: boolean; children: React.ReactNode; disabled: boolean }) {
  return (
    <div
      className={`${optionClasses[checked ? 'checked' : 'unchecked']} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </div>
  );
}

function UnitToggle({ currentChart }: { currentChart: string }) {
  const [value, setValue] = useState<'J' | 'Wh'>('J');

  // Charts that should grey out the toggle
  const greyedOutCharts = ['co2_emissions', 'installed_production_capacity', 'flexible_capacity'];
  const isGreyedOut = greyedOutCharts.includes(currentChart);

  useEffect(() => {
    const savedUnit = localStorage.getItem('defaultUnit');
    if (savedUnit) {
      setValue(savedUnit as 'J' | 'Wh');
    }
  }, []);

  const handleChange = (newValue: 'J' | 'Wh') => {
    if (!isGreyedOut) {
      setValue(newValue);
      localStorage.setItem('defaultUnit', newValue);
      window.dispatchEvent(new Event('unitChange'));
    }
  };

  return (
    <RadioGroup
      value={value}
      onChange={handleChange}
      className={`-my-1 ml-2 flex select-none items-center gap-1 rounded-md p-1 text-sm font-medium ${
        isGreyedOut ? 'bg-gray-200 opacity-50' : 'bg-gray-100'
      }`}
      disabled={isGreyedOut} // Disables the entire RadioGroup when greyed out
    >
      <RadioGroup.Label className="sr-only">Set Default Unit</RadioGroup.Label>
      <RadioGroup.Option value="J" disabled={isGreyedOut}>
        {({ checked }) => <Option checked={checked} disabled={isGreyedOut}>J</Option>}
      </RadioGroup.Option>
      <RadioGroup.Option value="Wh" disabled={isGreyedOut}>
        {({ checked }) => <Option checked={checked} disabled={isGreyedOut}>Wh</Option>}
      </RadioGroup.Option>
    </RadioGroup>
  );
}

export default UnitToggle;
