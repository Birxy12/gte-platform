import React from 'react';
import ProgressBar from "../../../components/layout/ProgressBar";

const ProgressPage = ({ userId }) => {
  return (
    <div>
      <h2>User Progress</h2>
      <ProgressBar userId={userId} />
    </div>
  );
};

export default ProgressPage;
