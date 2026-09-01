import { useEffect } from 'react';
import { connect } from 'react-redux';

import { useRouter } from 'next/router';

import { setColumns, setUserID } from '../store/actions';
import { AppState, Column } from '../store/types';
import useCurrentUser from '../utils/useCurrentUser';

/**
 * Given the window pathname, extracts the list of member session IDs to be shown in
 * the interface.
 */
const scenarioIDsFromQuery = (queryIDs: string): number[] => {
  const ids = queryIDs.split(',').map((id) => parseInt(id, 10));

  if (ids.some(isNaN)) {
    return [];
  }

  return ids;
};

const WithScenarios = ({
  children,
  setColumns,
  setUserID,
  columns,
}: {
  children: React.ReactNode;
  setColumns: (columns: Column[]) => void;
  setUserID: (userID: string | null) => void;
  columns: Column[];
}) => {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    const queryIDs = [router.query.scenarioIDs].flat()[0];

    if (!queryIDs || loading) return;

    setUserID(user?.id ?? null);
    setColumns(scenarioIDsFromQuery(queryIDs).map((sessionID) => ({ sessionID })));
  }, [router.query.scenarioIDs, user, loading, setColumns, setUserID]);

  if (columns.length) {
    return <>{children}</>;
  }

  return <div>No scenarios available</div>;
};

const mapStateToProps = (state: AppState) => ({
  columns: state.columns,
  failureReason: state.failureReason,
});

export default connect(mapStateToProps, { setColumns, setUserID })(WithScenarios);
