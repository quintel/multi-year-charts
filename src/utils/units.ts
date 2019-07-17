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
  { prefix: 'k', multiple: 1e3 },
  { prefix: '', multiple: 1 }
];

/**
 * Base unit names which may be scaled by Quantity.
 */
const BASE_UNITS: BaseUnit[] = [
  { name: 'J' },
  { name: 'T' },
  { name: 'tonne', displayName: 'T' },
  { name: 'W' },
  { name: 'Wh' }
];

// Stores all compiled units by their full name ("MJ", "TW").
let compiledUnits: { [name: string]: CompiledUnit } = {};

const maxPower = POWERS[0];
const minPower = POWERS[POWERS.length - 1];

BASE_UNITS.forEach(base => {
  POWERS.forEach(power => {
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
 * Takes a numerical value and a unit, enabling formatting and scaling to other
 * powers within the same base unit.
 */
class Quantity {
  value: number;
  unitName: string;
  unit: CompiledUnit;

  /**
   * Creates a new Quantity.
   *
   * @param {number} value
   *   The numeric value; the amount of "stuff".
   * @param {string} unitName
   *   The name of the unit being meastured. e.g. 'PJ', 'MW', etc).
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
    const newValue =
      this.value * (this.unit.power.multiple / otherUnit.power.multiple);

    return new Quantity(newValue, otherUnit.name);
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
    const value = this.toBase().value;

    // Divide the number by 10 to allow values up to 10_000 before moving up to
    // thousands, 10_000_000 before moving to millions, etc.
    const multiple = Math.pow(1000, powerOfThousand(value / 10));

    let power;

    if (multiple < minPower.multiple) {
      power = minPower;
    } else if (multiple > maxPower.multiple) {
      power = maxPower;
    } else {
      power = POWERS.find(power => power.multiple === multiple);
    }

    if (!power || power === this.unit.power) {
      return this;
    }

    return this.to(`${power.prefix}${this.unit.base.name}`);
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
  const bestUnit = new Quantity(maxValue, unitName).smartScale().unit.name;
  return (value: number) => new Quantity(value, unitName).to(bestUnit).format();
};
