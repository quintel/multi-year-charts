
import { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';

import { useRouter } from 'next/router';

import { setScenariosFromMycID } from '../store/actions';
import { AppState } from '../store/types';

const WithMyc = ({
  children,
  setScenariosFromMycID,
  mycID,
  scenarioIDs,
}: {
  children: React.ReactNode;
  setScenariosFromMycID: (mycID: number) => void;
  mycID: number | null;
  scenarioIDs: number[] | undefined;
}) => {
  const router = useRouter();

  useEffect(() => {
    router.query.mycID &&
    setScenariosFromMycID(Number(router.query.mycID));
  }, [Number(router.query.mycID), setScenariosFromMycID]);

  // TODO: another loading screen is needed! -> or an await?
  if (scenarioIDs && scenarioIDs.length) {
    return <Fragment>{children}</Fragment>;
  }

  return <div>No scenarios available</div>;
};

const mapStateToProps = (state: AppState) => ({
  scenarioIDs: state.scenarios,
  mycID: state.mycID,
  failureReason: state.failureReason,
});

export default connect(mapStateToProps, { setScenariosFromMycID })(WithMyc);
