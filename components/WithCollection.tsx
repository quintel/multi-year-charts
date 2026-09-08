import { useEffect } from 'react';
import { connect } from 'react-redux';

import Chrome from './Chrome';
import Loading from './Loading';
import MissingScenarios from './MissingScenarios';

import { remoteChange, setCollection, setColumns, setUserID } from '../store/actions';
import { AppState, CollectionState, Column } from '../store/types';
import useCurrentUser from '../utils/useCurrentUser';
import useResolvedCollection from '../utils/useResolvedCollection';

const POLL_MS = 5000;

/**
 * Resolves the collection named by the URL, puts it and its columns into the store, and renders
 * the children inside the app chrome once there are columns to show.
 *
 * It owns the not-found page too. Nothing else resolves the collection, so nothing else can tell
 * whether the URL names one we can show, and a flag in the store would outlive the only component
 * able to clear it.
 */
const WithCollection = ({
  children,
  remoteChange,
  setCollection,
  setColumns,
  setUserID,
  columns,
}: {
  children: React.ReactNode;
  remoteChange: (sessionID: number, stamp?: string) => void;
  setCollection: (collection: CollectionState) => void;
  setColumns: (columns: Column[]) => void;
  setUserID: (userID: string | null) => void;
  columns: Column[];
}) => {
  const { status, collection } = useResolvedCollection();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!collection || loading) return;

    setCollection({ id: collection.id, title: collection.title });
    setUserID(user?.id ?? null);
    setColumns(
      collection.members.map(({ scenarioID, title }) => ({ sessionID: scenarioID, title }))
    );
  }, [collection, user, loading, setCollection, setColumns, setUserID]);

  const watching = columns.map(({ sessionID }) => sessionID).join(',');

  useEffect(() => {
    if (!watching) return;

    const tick = async () => {
      if (document.hidden) return;

      const response = await fetch(`/api/sessions/stamps?ids=${watching}`);

      if (!response.ok) return;

      Object.entries<string>(await response.json()).forEach(([id, stamp]) =>
        remoteChange(Number(id), stamp)
      );
    };

    const timer = setInterval(tick, POLL_MS);

    return () => clearInterval(timer);
  }, [watching, remoteChange]);

  if (status === 'notFound') {
    return <MissingScenarios />;
  }

  // Resolved, and the store has caught up. Resolving the collection route is a round trip to
  // MyETM, so the wait is long enough to see, and long enough for the previous collection's
  // columns to still be in the store.
  const ready = status === 'ready' && columns.length > 0;

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
  columns: state.columns,
});

export default connect(mapStateToProps, { remoteChange, setCollection, setColumns, setUserID })(
  WithCollection
);
