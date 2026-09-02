import { InputCollectionData } from '../../api/types';
import { RESET, resetKeys } from '../reset';

const input = (attributes: Partial<InputCollectionData[string]> = {}) => ({
  default: 0,
  unit: '%',
  disabled: false,
  ...attributes,
});

describe('RESET', () => {
  it('is the value ETEngine reads as a reset', () => {
    expect(RESET).toBe('reset');
  });
});

describe('resetKeys', () => {
  it('sends one key for an input in no share group', () => {
    expect(resetKeys({ solar: input() }, 'solar')).toEqual(['solar']);
  });

  it('sends every member of a share group', () => {
    const inputs = {
      a: input({ share_group: 'heat' }),
      b: input({ share_group: 'heat' }),
      other: input(),
    };

    expect(resetKeys(inputs, 'a')).toEqual(['a', 'b']);
  });

  it('leaves out a member the dataset disabled', () => {
    const inputs = {
      a: input({ share_group: 'heat' }),
      b: input({ share_group: 'heat', disabled: true }),
    };

    expect(resetKeys(inputs, 'a')).toEqual(['a']);
  });
});
