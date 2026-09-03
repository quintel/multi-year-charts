import { connect } from 'react-redux';

import AreaInformation from './AreaInformation';
import { AppState } from '../store/types';

function SessionTitle({ title }: { title: string | null }) {
  if (!title || title.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800 pt-4 text-slate-300">
      <div className="container mx-auto flex border-b border-b-slate-700 pb-2">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="ml-auto flex items-center">
          <AreaInformation />
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state: AppState) => ({
  title: state.collection.title,
});

export default connect(mapStateToProps, {})(SessionTitle);
