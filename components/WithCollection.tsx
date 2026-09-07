import { useEffect } from 'react';
import { connect } from 'react-redux';

import Chrome from './Chrome';
import Loading from './Loading';
import MissingScenarios from './MissingScenarios';

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
    if (!collection) return;

    setCollection({ id: collection.id, title: collection.title });
    setScenarios(collection.members.map(({ scenarioID }) => scenarioID));
  }, [collection, setCollection, setScenarios]);

  if (status === 'notFound') {
    return <MissingScenarios />;
  }

  // Resolved, and the store has caught up.
  const ready = status === 'ready' && Boolean(scenarioIDs?.length);

  return (
    <Chrome>
      {ready ? (
        children
      ) : (
        <div className="container mx-auto flex justify-center py-24 text-gray-400">
          <Loading />
        </div>
      )}
    </Chrome>
  );
};

const mapStateToProps = (state: AppState) => ({
  scenarioIDs: state.scenarios,
});

export default connect(mapStateToProps, { setCollection, setScenarios })(WithCollection);
