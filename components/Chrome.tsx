import { connect } from 'react-redux';

import MainNav from '../components/MainNav';
import SubNav from '../components/SubNav';
import SessionTitle from '../components/SessionTitle';
import MissingScenarios from '../components/MissingScenarios';

import charts from '../data/charts';

import { AppState } from '../store/types';

function Chrome({
  children,
  failureReason,
}: {
  children: React.ReactNode;
  failureReason: AppState['failureReason'];
}) {
  if (failureReason) {
    return <MissingScenarios />;
  }

  return (
    <>
      <MainNav />
      <SessionTitle />
      <SubNav charts={charts} />
      {children}
    </>
  );
}

const mapStateToProps = (state: AppState) => ({
  failureReason: state.failureReason,
});

export default connect(mapStateToProps, {})(Chrome);
