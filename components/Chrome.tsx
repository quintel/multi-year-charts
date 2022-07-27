import MainNav from '../components/MainNav';
import SubNav from '../components/SubNav';

import charts from '../data/charts';

export default function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainNav />
      <SubNav charts={charts} />
      {children}
    </>
  );
}
