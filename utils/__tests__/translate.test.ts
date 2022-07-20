import translate from '../translate';

const messages = {
  valid: 'Message text',
  singleInterpolate: 'Hello {text}',
  multiInterpolate: '{noun} is {adjective} {adjective}'
};

it('returns translations when they exist', () => {
  expect(translate('valid', messages)).toEqual('Message text');
});

it('returns the translation key when the translation does not exist', () => {
  expect(translate('invalid', messages)).toEqual('invalid');
});

it('interpolates single values', () => {
  expect(translate('singleInterpolate', messages, { text: 'World' })).toEqual(
    'Hello World'
  );
});

it('ignores invalid interpolation keys', () => {
  expect(
    translate('singleInterpolate', messages, { text: 'World', other: 'Thing' })
  ).toEqual('Hello World');
});

it('interpolates many values', () => {
  expect(
    translate('multiInterpolate', messages, { noun: 'A', adjective: 'Z' })
  ).toEqual('A is Z Z');
});
