import { Quantity, createScalingFormatter, getDefaultUnit, setDefaultUnit } from '../units';

describe('Quantity class', () => {

  it('should correctly initialize a Quantity instance', () => {
    const quantity = new Quantity(1000, 'MJ');
    expect(quantity.value).toBe(1000);
    expect(quantity.unitName).toBe('MJ');
    expect(quantity.unit.name).toBe('MJ');
  });

  it('should convert to another unit', () => {
    const quantity = new Quantity(8000, 'MWh');
    const converted = quantity.to('GWh');
    expect(converted.value).toBe(8);
    expect(converted.unitName).toBe('GWh');
  });

  it('should convert to base unit', () => {
    const quantity = new Quantity(5, 'MT');
    const base = quantity.toBase();
    expect(base.value).toBe(5000000);
    expect(base.unitName).toBe('T');
  });

  it('should convert to the default unit', () => {
    setDefaultUnit('Wh');
    const quantity = new Quantity(5000, 'PJ');
    const defaultUnit = quantity.toDefault();
    expect(defaultUnit.value).toBeCloseTo(1388888889999999.8);
    expect(defaultUnit.unitName).toBe('Wh');
  });

  it('should smart scale the quantity', () => {
    const quantity = new Quantity(5000000, 'J');
    const scaled = quantity.smartScale();
    expect(scaled.value).toBe(5000);
    expect(scaled.unitName).toBe('KJ');
  });

  it('should handle NaN in format', () => {
    const quantity = new Quantity(NaN, 'PJ');
    expect(quantity.format()).toBe('');
  });

  it('should compare quantities using valueOf', () => {
    const quantity = new Quantity(50, 'MT');
    expect(quantity.valueOf() > 40).toBe(true);
    expect(quantity.valueOf() > 50).toBe(false);
  });
});

describe('createScalingFormatter function', () => {

  beforeEach(() => {
    setDefaultUnit('PJ');
  });

  it('should scale units when created with 10 and "MJ"', () => {
    const formatter = createScalingFormatter(10, 'MJ');

    expect(formatter(0.512345)).toEqual('0.51 MJ');
    expect(formatter(0.5)).toEqual('0.5 MJ');
    expect(formatter(1.5)).toEqual('1.5 MJ');
    expect(formatter(15)).toEqual('15 MJ');
    expect(formatter(15000)).toEqual('15000 MJ');
  });

  it('should scale units when created with 10 and "GJ"', () => {
    const formatter = createScalingFormatter(10, 'GJ');

    expect(formatter(0.512345)).toEqual('0.51 GJ');
    expect(formatter(0.5)).toEqual('0.5 GJ');
    expect(formatter(1.5)).toEqual('1.5 GJ');
    expect(formatter(15)).toEqual('15 GJ');
    expect(formatter(15000)).toEqual('15000 GJ');
  });

  it('should scale units when created with 10000 and "MJ"', () => {
    const formatter = createScalingFormatter(10000, 'MJ');

    expect(formatter(0.512345)).toEqual('0 GJ');
    expect(formatter(15)).toEqual('0.02 GJ');
    expect(formatter(140)).toEqual('0.14 GJ');
    expect(formatter(1000)).toEqual('1 GJ');
    expect(formatter(1010)).toEqual('1.01 GJ');
    expect(formatter(15000)).toEqual('15 GJ');
  });

  it('should scale units when created with 0.5 and "GJ"', () => {
    const formatter = createScalingFormatter(0.5, 'GJ');

    expect(formatter(0.1)).toEqual('100 MJ');
    expect(formatter(0.512345)).toEqual('512.35 MJ');
    expect(formatter(1.00001)).toEqual('1000.01 MJ');
    expect(formatter(1.0)).toEqual('1000 MJ');
    expect(formatter(3.0)).toEqual('3000 MJ');
  });
});

describe('getDefaultUnit and setDefaultUnit functions', () => {

  it('should return the default unit', () => {
    expect(getDefaultUnit()).toBe('PJ');
  });

  it('should set and retrieve the default unit', () => {
    setDefaultUnit('TWh');
    expect(getDefaultUnit()).toBe('TWh');
  });
});
