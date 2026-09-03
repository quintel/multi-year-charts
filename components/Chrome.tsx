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
  collectionNotFound,
}: {
  children: React.ReactNode;
  failureReason: AppState['failureReason'];
  collectionNotFound: boolean;
}) {
  if (failureReason || collectionNotFound) {
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
  collectionNotFound: state.collection.notFound,
});

export default connect(mapStateToProps, {})(Chrome);
