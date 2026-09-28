import { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useRouter } from 'next/router';

import Chrome from './Chrome';
import PageLoading from './PageLoading';
import MissingScenarios from './MissingScenarios';

import { remoteChange, setCollection, setColumns, setUserID } from '../store/actions';
import { AppState, CollectionState, Column } from '../store/types';
import { isNewer } from '../utils/api/middleware';
import useCurrentUser from '../utils/useCurrentUser';
import useResolvedCollection from '../utils/useResolvedCollection';

const POLL_MS = 5000;
const RESOLVE_MS = 300_000;

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
  const [attempt, setAttempt] = useState(0);
  const { status, collection } = useResolvedCollection(attempt);
  const scenarioStamps = useRef<Record<string, string>>({});
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!collection || loading) return;

    setCollection({ id: collection.id, title: collection.title });
    setUserID(user?.id ?? null);
    setColumns(collection.members.map(({ scenarioID }) => ({ sessionID: scenarioID })));
  }, [collection, user, loading, setCollection, setColumns, setUserID]);

  const watching = columns.map(({ sessionID }) => sessionID).join(',');
  const saved = collection?.members
    .flatMap(({ savedScenarioID }) => savedScenarioID ?? [])
    .join(',');

  useEffect(() => {
    if (!watching) return;

    const tick = async () => {
      if (document.hidden) return;

      const response = await fetch(`/api/sessions/stamps?ids=${watching}&scenarios=${saved}`);

      if (!response.ok) return;

      const { stamps, scenarios } = await response.json();

      Object.entries<string>(stamps).forEach(([id, stamp]) => remoteChange(Number(id), stamp));

      // A saved scenario that moved may be bound to another session, repoint
      const savedElsewhere = Object.entries<string>(scenarios).some(([id, stamp]) =>
        isNewer(stamp, scenarioStamps.current[id])
      );

      scenarioStamps.current = { ...scenarioStamps.current, ...scenarios };

      if (savedElsewhere) setAttempt((n) => n + 1);
    };

    const polling = setInterval(tick, POLL_MS);
    const resolving = setInterval(() => document.hidden || setAttempt((n) => n + 1), RESOLVE_MS);

    return () => {
      clearInterval(polling);
      clearInterval(resolving);
    };
  }, [watching, saved, remoteChange]);

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
