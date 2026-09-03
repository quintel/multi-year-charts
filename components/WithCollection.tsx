import { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';

import Loading from './Loading';

import { setCollection, setScenarios } from '../store/actions';
import { AppState, CollectionState } from '../store/types';
import useResolvedCollection from '../utils/useResolvedCollection';

/**
 * Resolves the collection named by the URL and puts it into the store, rendering the children only
 * once it holds scenarios to show.
 */
const WithCollection = ({
  children,
  setCollection,
  setScenarios,
  scenarioIDs,
}: {
  children: React.ReactNode;
  setCollection: (collection: CollectionState) => void;
  setScenarios: (scenarioIDs: number[]) => void;
  scenarioIDs: number[] | undefined;
}) => {
  const { status, collection } = useResolvedCollection();

  useEffect(() => {
    if (status === 'notFound') {
      setCollection({ id: null, title: null, notFound: true });
      return;
    }

    if (!collection) return;

    setCollection({ id: collection.id, title: collection.title, notFound: false });
    setScenarios(collection.scenarioIDs);
  }, [status, collection, setCollection, setScenarios]);

  if (status === 'notFound') {
    return null;
  }

  // Still resolving, or resolved but the store has not caught up yet. Resolving is a round trip to
  // MyETM on the collection route, so this window is long enough to see.
  if (!scenarioIDs || !scenarioIDs.length) {
    return (
      <div className="container mx-auto flex justify-center py-24 text-gray-400">
        <Loading />
      </div>
    );
  }

  return <Fragment>{children}</Fragment>;
};

const mapStateToProps = (state: AppState) => ({
  scenarioIDs: state.scenarios,
});

export default connect(mapStateToProps, { setCollection, setScenarios })(WithCollection);
