import { connect } from 'react-redux';

import MainNav from '../components/MainNav';
import SubNav from '../components/SubNav';
import MissingScenarios from '../components/MissingScenarios';
import PageLoading from '../components/PageLoading';

import charts from '../data/charts';

import { AppState } from '../store/types';
import useRouteChange from '../utils/useRouteChange';

function Chrome({
  children,
  failureReason,
}: {
  children: React.ReactNode;
  failureReason: AppState['failureReason'];
}) {
  const { pending, slow } = useRouteChange();

  if (failureReason) {
    return <MissingScenarios />;
  }

  return (
    <>
      <MainNav />
      <SubNav charts={charts} pending={pending} />
      {slow ? <PageLoading /> : children}
    </>
  );
}

const mapStateToProps = (state: AppState) => ({
  failureReason: state.failureReason,
});

export default connect(mapStateToProps, {})(Chrome);
