import { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';

import { useRouter } from 'next/router';

import { setScenarios } from '../store/actions';
import { AppState } from '../store/types';

/**
 * Given the window pathname, extracts the list of scenario IDs to be shown in
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
  setScenarios,
  scenarioIDs,
}: {
  children: React.ReactNode;
  setScenarios: (scenarioIDs: number[]) => void;
  scenarioIDs: number[] | undefined;
}) => {
  const router = useRouter();

  useEffect(() => {
    router.query.scenarioIDs &&
      setScenarios(scenarioIDsFromQuery([router.query.scenarioIDs].flat()[0]));
  }, [router.query.scenarioIDs, setScenarios]);

  if (scenarioIDs && scenarioIDs.length) {
    return <Fragment>{children}</Fragment>;
  }

  return <div>No scenarios available</div>;
};

const mapStateToProps = (state: AppState) => ({
  scenarioIDs: state.scenarios,
  failureReason: state.failureReason,
});

export default connect(mapStateToProps, { setScenarios })(WithScenarios);
