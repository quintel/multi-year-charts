import React from 'react';

const Loading = () => {
  return (
    <div className="loading column is-half is-offset-one-quarter">
      <progress className="progress is-info" max="100" />
    </div>
  );
};

export default Loading;
