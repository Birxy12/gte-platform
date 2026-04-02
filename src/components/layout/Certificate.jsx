import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Certificate = ({ userId }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchCertificates = async () => {
      try {
        const q = query(
          collection(db, 'progress'),
          where('userId', '==', userId),
          where('completed', '==', true)
        );
        const snap = await getDocs(q);
        setCertificates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('Error fetching certificates:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [userId]);

  if (loading) return <p>Loading certificates...</p>;
  if (!certificates.length) return <p>No certificates earned yet.</p>;

  return (
    <div>
      {certificates.map(cert => (
        <div key={cert.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <h3>🎓 {cert.courseTitle || 'Course Completed'}</h3>
          <p>Completed: {cert.completedAt?.toDate ? cert.completedAt.toDate().toLocaleDateString() : 'Recently'}</p>
        </div>
      ))}
    </div>
  );
};

export default Certificate;
