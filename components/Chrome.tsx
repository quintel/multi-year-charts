import MainNav from '../components/MainNav';
import SubNav from '../components/SubNav';
import SessionTitle from '../components/SessionTitle';

import charts from '../data/charts';

export default function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainNav />
      <SessionTitle />
      <SubNav charts={charts} />
      {children}
    </>
  );
}
