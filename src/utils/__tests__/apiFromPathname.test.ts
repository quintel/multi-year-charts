import idsFromPathname from '../idsFromPathname';

it('returns [1] from "/1/"', () => {
  expect(idsFromPathname('/1/')).toEqual([1]);
});

it('returns [1] from "/1"', () => {
  expect(idsFromPathname('/1')).toEqual([1]);
});

it('returns [1, 2] from "/1,2', () => {
  expect(idsFromPathname('/1,2')).toEqual([1, 2]);
});

it('returns [1, 2] from "/1,2/charts', () => {
  expect(idsFromPathname('/1,2/charts')).toEqual([1, 2]);
});

it('returns [1] from "/1a"', () => {
  expect(idsFromPathname('/1a')).toEqual([1]);
});

it('returns [] from "/a1"', () => {
  expect(idsFromPathname('/a1')).toEqual([]);
});

it('returns [] from "/1,a,b"', () => {
  expect(idsFromPathname('/1,a,b')).toEqual([]);
});

it('returns [] from "/"', () => {
  expect(idsFromPathname('/')).toEqual([]);
});

it('returns [] from ""', () => {
  expect(idsFromPathname('')).toEqual([]);
});
