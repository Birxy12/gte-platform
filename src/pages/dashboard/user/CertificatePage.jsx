import React from 'react';
import Certificate from '../../../components/layout/Certificate';

const CertificatePage = ({ userId }) => {
  return (
    <div>
      <h2>Certificate of Completion</h2>
      <Certificate userId={userId} />
    </div>
  );
};

export default CertificatePage;
