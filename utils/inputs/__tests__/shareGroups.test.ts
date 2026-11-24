import { InputCollectionData, InputData } from '../../api/types';
import { groupTotal, isBalanced, memberValue } from '../shareGroups';

const member = (attributes: Partial<InputData>): InputData => ({
  default: 0,
  unit: '%',
  disabled: false,
  share_group: 'heating',
  step: 0.1,
  min: 0,
  max: 100,
  ...attributes,
});

const inputs: InputCollectionData = {
  gas: member({ user: 33.333333 }),
  heat_pump: member({ default: 33.333333 }),
  electric: member({ user: 33.333334 }),
};

describe('groupTotal', () => {
  it('sums what the engine holds while the group is untouched', () => {
    expect(groupTotal(inputs, {}, 'heating')).toBe(100);
  });

  it('counts untyped members at their step once the group is touched', () => {
    expect(groupTotal(inputs, { gas: 33.3 }, 'heating')).toBe(99.9);
  });

  it('balances a group corrected by eye', () => {
    expect(isBalanced(groupTotal(inputs, { gas: 33.4 }, 'heating'))).toBe(true);
  });
});

describe('memberValue', () => {
  it('prefers the typed value', () => {
    expect(memberValue(inputs.gas, 40, true)).toBe(40);
  });

  it('steps but never clamps, because the engine holds members outside their range mid balance', () => {
    expect(memberValue(member({ user: 105.04 }), undefined, true)).toBe(105);
  });

  it('leaves an untouched member as the engine holds it', () => {
    expect(memberValue(inputs.gas, undefined, false)).toBe(33.333333);
  });
});
