import { connect } from 'react-redux';

import { AppState } from '../store/types';

function SessionTitle({ title }: { title: string | null }) {
  if (!title || title.length === 0) {
    return null;
  }

  return (
    <h1 className="ml-3 min-w-0 truncate border-l border-gray-600 pl-3 font-semibold text-gray-100">
      {title}
    </h1>
  );
}

const mapStateToProps = (state: AppState) => ({
  title: state.collection.title,
});

export default connect(mapStateToProps, {})(SessionTitle);
