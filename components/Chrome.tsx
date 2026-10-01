import { connect } from 'react-redux';

import MainNav from '../components/MainNav';
import SubNav from '../components/SubNav';
import MissingScenarios from '../components/MissingScenarios';

import charts from '../data/charts';

import { AppState } from '../store/types';
import useRouteChange from '../utils/useRouteChange';
import { usePublishNavHeight } from '../utils/useNavHeight';

function Chrome({
  children,
  failureReason,
}: {
  children: React.ReactNode;
  failureReason: AppState['failureReason'];
}) {
  const pending = useRouteChange();
  const navRef = usePublishNavHeight<HTMLDivElement>();

  if (failureReason) {
    return <MissingScenarios />;
  }

  return (
    <div className="w-max min-w-full">
      <div ref={navRef} className="sticky top-0 z-40">
        <MainNav />
        <SubNav charts={charts} pending={pending} />
      </div>
      {children}
    </div>
  );
}

const mapStateToProps = (state: AppState) => ({
  failureReason: state.failureReason,
});

export default connect(mapStateToProps, {})(Chrome);
