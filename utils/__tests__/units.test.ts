import { createScalingFormatter } from '../units';

it('scales units when created with 10 and "MJ"', () => {
  const formatter = createScalingFormatter(10, 'MJ');

  expect(formatter(0.512345)).toEqual('0.51 MJ');
  expect(formatter(0.5)).toEqual('0.5 MJ');
  expect(formatter(1.5)).toEqual('1.5 MJ');
  expect(formatter(15)).toEqual('15 MJ');
  expect(formatter(15000)).toEqual('15000 MJ');
});

it('scales units when created with 10 and "GJ"', () => {
  const formatter = createScalingFormatter(10, 'GJ');

  expect(formatter(0.512345)).toEqual('0.51 GJ');
  expect(formatter(0.5)).toEqual('0.5 GJ');
  expect(formatter(1.5)).toEqual('1.5 GJ');
  expect(formatter(15)).toEqual('15 GJ');
  expect(formatter(15000)).toEqual('15000 GJ');
});

it('scales units when created with 10000 and "MJ"', () => {
  const formatter = createScalingFormatter(10000, 'MJ');

  expect(formatter(0.512345)).toEqual('0 GJ');
  expect(formatter(15)).toEqual('0.01 GJ');
  expect(formatter(140)).toEqual('0.14 GJ');
  expect(formatter(1000)).toEqual('1 GJ');
  expect(formatter(1010)).toEqual('1.01 GJ');
  expect(formatter(15000)).toEqual('15 GJ');
});

it('scales units when created with 0.5 and "GJ"', () => {
  const formatter = createScalingFormatter(0.5, 'GJ');

  expect(formatter(0.1)).toEqual('100 MJ');
  expect(formatter(0.512345)).toEqual('512.35 MJ');
  expect(formatter(1.00001)).toEqual('1000.01 MJ');
  expect(formatter(1.0)).toEqual('1000 MJ');
  expect(formatter(3.0)).toEqual('3000 MJ');
});
