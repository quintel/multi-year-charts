interface BaseUnit {
  name: string;
  displayName?: string;
}

interface Power {
  prefix: string;
  multiple: number;
}

interface CompiledUnit {
  name: string;
  displayName: string;
  base: BaseUnit;
  power: Power;
}

/**
 * Represent a function which can be called to format a query value with the
 * unit.
 */
export type UnitFormatter = (val: number) => string;

/**
 * Retrieves the default unit from local storage or returns 'PJ' as the default.
 */
export function getDefaultUnit(): string {
  return localStorage.getItem('defaultUnit') || 'PJ';
}

/**
 * Sets the default unit in local storage.
 */
export function setDefaultUnit(unit: string): void {
  localStorage.setItem('defaultUnit', unit);
}

/**
 * Orders of magnitude which determine how a value may be scaled from one to
 * another.
 */
const POWERS: Power[] = [
  { prefix: 'Y', multiple: 1e24 },
  { prefix: 'Z', multiple: 1e21 },
  { prefix: 'E', multiple: 1e18 },
  { prefix: 'P', multiple: 1e15 },
  { prefix: 'T', multiple: 1e12 },
  { prefix: 'G', multiple: 1e9 },
  { prefix: 'M', multiple: 1e6 },
  { prefix: 'K', multiple: 1e3 },
  { prefix: '', multiple: 1 },
];

/**
 * Base unit names which may be scaled by Quantity.
 */
const BASE_UNITS: BaseUnit[] = [
  { name: 'J' },
  { name: 'T' },
  { name: 'tonne', displayName: 'T' },
  { name: 'W' },
  { name: 'Wh', displayName: 'Wh' },
];

// Stores all compiled units by their full name ("MJ", "TW").
const compiledUnits: { [name: string]: CompiledUnit } = {};


BASE_UNITS.forEach((base) => {
  POWERS.forEach((power) => {
    const name = `${power.prefix}${base.name}`;
    const displayName = `${power.prefix}${base.displayName || base.name}`;

    compiledUnits[name] = { name, displayName, base, power };
  });
});

/**
 * Retrieves a compiled unit by its full name (e.g. "PJ", "MWh") or throws an
 * error if the unit does not exist.
 */
const getUnit = (name: string) => {
  const unit = compiledUnits[name];

  if (!unit) {
    throw `Unknown unit: ${name}`;
  }

  return unit;
};

/**
 * Determines the "power of thousand" of a number.
 *
 * @example Given values between 0 and 999
 *   powerOfThousand(0)
 *   // => 0
 *   powerOfThousand(999)
 *   // => 0
 *
 * @example Given values between 1000 and 999,999
 *   powerOfThousand(1000)
 *   // => 1
 *   powerOfThousand(999999)
 *   // => 1
 *
 */
const powerOfThousand = (value: number) => {
  if (value === 0) {
    return 0;
  }

  return Math.trunc(Math.log(Math.abs(value)) / Math.log(1000));
};

/**
 * Conversion factors for specific unit conversions that are not simple powers of 10.
 */
const specificConversionFactors: { [key: string]: number } = {
  'J-Wh': 2.77777778e-4, // Joules to Watt hours
  'Wh-J': 3600, // Watt hours to Joules
  // You can add more specific unit conversions here
};

/**
 * Converts a value from one unit to another considering specific conversion factors.
 */
const convertValue = (value: number, fromUnit: string, toUnit: string): number => {
  // console.log("value, fromUnit, toUnit", value, fromUnit, toUnit);
  const conversionKey = `${fromUnit}-${toUnit}`;
  if (specificConversionFactors[conversionKey]) {
    return value * specificConversionFactors[conversionKey];
  }
  return value * (getUnit(fromUnit).power.multiple / getUnit(toUnit).power.multiple);
};

/**
 * Takes a numerical value and a unit, enabling formatting and scaling to other
 * powers within the same base unit.
 */
export class Quantity {
  value: number;
  unitName: string;
  unit: CompiledUnit;

  /**
   * Creates a new Quantity.
   *
   * @param {number} value
   *   The numeric value; the amount of "stuff".
   * @param {string} unitName
   *   The name of the unit being measured. e.g. 'PJ', 'MW', etc).
   */
  constructor(value: number, unitName: string) {
    this.value = value;
    this.unitName = unitName;
    this.unit = getUnit(unitName);
  }

  /**
   * Converts the quantity to a different quantity.
   *
   * @example
   *   new Quantity(8000, 'MWh').to('GWh')
   *   // => Quantity(8, 'GWh')
   */
  to(otherName: string) {
    const otherUnit = getUnit(otherName);
    const newValue = convertValue(this.value, this.unitName, otherUnit.name);
    return new Quantity(newValue, otherUnit.name);
  }

  /**
   * Converts the quantity to the default unit.
   */
  toDefault() {
    const defaultUnit = getDefaultUnit();
    console.log("default unit : ", defaultUnit);
    return this.to(defaultUnit);
  }

  /**
   * The value in the "base" unit.
   *
   * @example
   *   new Quantity(5, 'Mton').toBase()
   *   // => Quantity(5000, 'ton')
   */
  toBase() {
    return this.to(this.unit.base.name);
  }

  /**
   * If the value contained in the unit is much larger or smaller than is
   * suitable for the unit, smartScale will return the value in a more
   * appropriate unit.
   *
   * @example
   *   new Quantity(5000000, 'J').smartScale()
   *   // => Quantity(5, 'MJ')
   */
  smartScale() {
    // console.log("initial value and unit", this.value, this.unitName);
    const baseQuantity = this.toBase();
    const value = baseQuantity.value;
    console.log("base value and unit : ", value, baseQuantity.unitName);

    // Ensure value is positive and non-zero to avoid log10 issues
    if (value <= 1) {
      return this;
    }

    const powerIndex = Math.floor(Math.log10(value) / 3);
    const adjustedIndex = (powerIndex % 3 === 0 ? powerIndex : (powerIndex % 3 === 1 ? powerIndex - 1 : powerIndex + 1))/3-1;
    console.log("power index : ", powerIndex, adjustedIndex);
    const power = POWERS[adjustedIndex] || POWERS[0];

    if (power === this.unit.power) {
      return this;
    }
    console.log("power : ", power);

    const newUnitName = `${power.prefix}${this.unit.base.name}`;
    const newValue = value / power.multiple;
    console.log("new value and unit : ", newValue, newUnitName);

    return new Quantity(newValue, newUnitName);
  }

  /**
   * Formats the quantity as a human-readable string, with an optional
   * precision argument to control the maximum number of decimal places.
   *
   * @example
   *   const quantity = new Quantity('5000.2', 'PJ')
   *
   *   quantity.format()
   *   // => "5,000.2 PJ"
   *
   *   quantity.format(0)
   *   // => "5,000 PJ"
   */
  format(precision = 2) {
    if (isNaN(this.value)) {
      return '';
    }

    const [decimal, fraction] = this.value.toFixed(precision).split('.');
    let fixedValue = decimal;

    const strippedFraction = fraction.replace(/0+$/g, '');

    if (strippedFraction.length) {
      fixedValue = `${decimal}.${strippedFraction}`;
    }

    return `${fixedValue} ${this.unit.displayName || this.unit.name}`;
  }

  toString() {
    return this.format();
  }

  /**
   * Coerces Quantity into numbers so that it may be used in expressions.
   *
   * @example
   *   quantity = new Quantity(50, 'kg')
   *   quantity > 50 // false
   *   quantity > 40 // true
   */
  valueOf() {
    return this.value;
  }
}

/**
 * Creates a function capable of scaling the given number, and all smaller
 * numbers, to an appropriate unit.
 *
 * @example
 *   const formatter = createScalingFormatter(15000, 'MT')
 *   formatter(25000) // => "25 GT"
 *   formatter(1000) // => "1 GT"
 *   formatter(100) // => "0.1 GT"
 */
export const createScalingFormatter = (maxValue: number, unitName: string) => {
  const defaultUnitName = getDefaultUnit();
  const bestUnit = new Quantity(maxValue, unitName).to(defaultUnitName).smartScale().unit.name;
  return (value: number) => new Quantity(value, unitName).to(bestUnit).format();
};
