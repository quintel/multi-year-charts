import { renderHook } from '@testing-library/react';

import useLinkHelper from '../useLinkHelper';

let query: Record<string, string | string[]> = {};

jest.mock('next/router', () => ({
  useRouter: () => ({ query, replace: jest.fn() }),
}));

beforeEach(() => {
  query = {};
});

const linkTo = (href: string) => renderHook(() => useLinkHelper()).result.current.linkTo(href);
const hasCollection = () => renderHook(() => useLinkHelper()).result.current.hasCollection();

describe('on the collection route', () => {
  beforeEach(() => {
    query = { collectionID: '42' };
  });

  it('prefixes links with the collection path', () => {
    expect(linkTo('/inputs')).toEqual('/collections/42/inputs');
  });

  it('accepts a href without a leading slash', () => {
    expect(linkTo('inputs')).toEqual('/collections/42/inputs');
  });

  it('does not carry a title in the URL', () => {
    query = { collectionID: '42', title: 'Spoofed' };

    expect(linkTo('/inputs')).toEqual('/collections/42/inputs');
  });

  it('has a collection', () => {
    expect(hasCollection()).toBe(true);
  });
});

describe('on the legacy scenario-ids route', () => {
  beforeEach(() => {
    query = { scenarioIDs: '1,2' };
  });

  it('prefixes links with the scenario ids', () => {
    expect(linkTo('/inputs')).toEqual('/1,2/inputs');
  });

  it('carries the title through, since the URL is where it lives', () => {
    query = { scenarioIDs: '1,2', title: 'A title' };

    expect(linkTo('/inputs')).toEqual('/1,2/inputs?title=A%20title');
  });

  it('has a collection', () => {
    expect(hasCollection()).toBe(true);
  });
});

describe('on a URL naming no collection', () => {
  it('has no collection', () => {
    expect(hasCollection()).toBe(false);
  });
});
