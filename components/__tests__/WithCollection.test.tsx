import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import WithCollection from '../WithCollection';
import rootReducer from '../../store/reducers';
import type { Resolution } from '../../utils/useResolvedCollection';

let resolution: Resolution;

jest.mock('../../utils/useResolvedCollection', () => ({
  __esModule: true,
  default: () => resolution,
}));

// WithCollection renders the chrome, whose navs read the router and ask /api/me who is signed in.
jest.mock('next/router', () => ({
  useRouter: () => ({ query: {}, asPath: '/', replace: jest.fn(), push: jest.fn() }),
}));

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ user: null }) });
});

const renderGuard = () =>
  render(
    <Provider store={createStore(rootReducer)}>
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
