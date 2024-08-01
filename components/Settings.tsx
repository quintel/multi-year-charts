import React, { useState, useEffect } from 'react';
import { getDefaultUnit, setDefaultUnit } from '../utils/units';

const Settings: React.FC = () => {
  const [unit, setUnit] = useState(getDefaultUnit());

  const handleUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUnit = event.target.value;
    setUnit(selectedUnit);
    setDefaultUnit(selectedUnit);
    window.location.reload(); // Reload the page to apply the new unit setting
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <select
          value=""
          onChange={handleUnitChange}
          className="bg-gray-800 text-white border-none rounded p-1"
        >
          <option value="" disabled>
            Select Unit Type
          </option>
          <option value="J" className={unit === 'J' ? 'bg-blue-500 text-white' : ''}>PJ</option>
          <option value="Wh" className={unit === 'Wh' ? 'bg-blue-500 text-white' : ''}>TWh</option>
        </select>
      </div>
    </div>
  );
};

export default Settings;
