import { useEffect } from 'react';
import { connect } from 'react-redux';
import { useRouter } from 'next/router';

import Chrome from './Chrome';
import PageLoading from './PageLoading';
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
  storedCollection,
}: {
  children: React.ReactNode;
  remoteChange: (sessionID: number, stamp?: string) => void;
  setCollection: (collection: CollectionState) => void;
  setColumns: (columns: Column[]) => void;
  setUserID: (userID: string | null) => void;
  columns: Column[];
  storedCollection: CollectionState;
}) => {
  const router = useRouter();
  const { status, collection } = useResolvedCollection();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!collection || loading) return;

    setCollection({ id: collection.id, title: collection.title });
    setUserID(user?.id ?? null);
    setColumns(collection.members.map(({ scenarioID }) => ({ sessionID: scenarioID })));
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

  const urlCollectionID = String(router.query.collectionID ?? '');
  const held = urlCollectionID !== '' && urlCollectionID === String(storedCollection.id ?? '');
  const ready = columns.length > 0 && (status === 'ready' || held);

  return (
    <Chrome>
      {ready ? (
        children
      ) : (
        <PageLoading />
      )}
    </Chrome>
  );
};

const mapStateToProps = (state: AppState) => ({
  columns: state.columns,
  storedCollection: state.collection,
});

export default connect(mapStateToProps, { remoteChange, setCollection, setColumns, setUserID })(
  WithCollection
);
