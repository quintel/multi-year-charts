import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import WithCollection from '../WithCollection';
import rootReducer from '../../store/reducers';
import { setCollection, setColumns } from '../../store/actions';
import type { Resolution } from '../../utils/useResolvedCollection';

let resolution: Resolution;
let query: Record<string, string>;

jest.mock('../../utils/useResolvedCollection', () => ({
  __esModule: true,
  default: () => resolution,
}));

// WithCollection renders the chrome, whose navs read the router.
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    query,
    asPath: '/',
    events: { on: jest.fn(), off: jest.fn() },
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

// Columns are not set until the sign-in check settles, which is a request in the real thing.
jest.mock('../../utils/useCurrentUser', () => ({
  __esModule: true,
  default: () => ({ user: null, loading: false }),
}));

beforeEach(() => {
  query = {};
  global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ user: null }) });
});

const renderGuard = (store = createStore(rootReducer)) =>
  render(
    <Provider store={store}>
      <WithCollection>
        <div>the charts</div>
      </WithCollection>
    </Provider>
  );

it('renders the children once the collection resolves', () => {
  resolution = {
    status: 'ready',
    collection: {
      id: 42,
      title: 'A collection',
      members: [
        { scenarioID: 1, title: 'One' },
        { scenarioID: 2, title: 'Two' },
      ],
    },
  };
  renderGuard();

  expect(screen.queryByText('the charts')).not.toBeNull();
});

it('shows the not-found page when the collection cannot be read', () => {
  resolution = { status: 'notFound', collection: null };
  renderGuard();

  // The default locale context echoes the key back, so the message id is what renders.
  expect(screen.queryByText('missingScenarios.title')).not.toBeNull();
  expect(screen.queryByText('the charts')).toBeNull();
});

// Resolving the collection route is a round trip to MyETM. Reporting that as "no scenarios" for its
// duration shows a not-found message to everyone whose collection is perfectly fine.
it('does not claim the scenarios are missing while it is still resolving', () => {
  resolution = { status: 'loading', collection: null };
  renderGuard();

  expect(screen.queryByText('missingScenarios.title')).toBeNull();
  expect(screen.queryByText('the charts')).toBeNull();
});

// A route change remounts the guard, so the resolver starts over at 'loading' even though the store
// still holds the collection. Blanking the page then makes every navigation flash a spinner
it('keeps rendering the children while re-resolving a collection the store already holds', () => {
  const store = createStore(rootReducer);

  store.dispatch(setCollection({ id: 42, title: 'A collection' }));
  store.dispatch(setColumns([{ sessionID: 1 }, { sessionID: 2 }]));

  query = { collectionID: '42' };
  resolution = { status: 'loading', collection: null };
  renderGuard(store);

  expect(screen.queryByText('the charts')).not.toBeNull();
});

it('does not stand the held collection in for a different one', () => {
  const store = createStore(rootReducer);

  store.dispatch(setCollection({ id: 42, title: 'A collection' }));
  store.dispatch(setColumns([{ sessionID: 1 }, { sessionID: 2 }]));

  query = { collectionID: '43' };
  resolution = { status: 'loading', collection: null };
  renderGuard(store);

  expect(screen.queryByText('the charts')).toBeNull();
});
