import React, { useRef } from 'react';
import { X, Download, Award } from 'lucide-react';
import './CertificateModal.css';

export default function CertificateModal({ course, profile, onClose }) {
  const certRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = course.completedAt?.toDate 
    ? course.completedAt.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const studentName = profile?.username || profile?.displayName || "Student";

  return (
    <div className="cert-modal-overlay" onClick={onClose}>
      <div className="cert-modal-content" onClick={e => e.stopPropagation()}>
        <div className="cert-actions">
          <button onClick={handlePrint} className="cert-btn" title="Download / Print">
            <Download size={20} />
          </button>
          <button onClick={onClose} className="cert-btn" title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="cert-document" ref={certRef}>
          <div className="cert-watermark">GLOBIX ACADEMY</div>
          
          <div className="cert-header">
            <img src="/GlobixTech-logo.png" alt="Globix Academy" className="cert-logo" />
            <h1>Certificate of Completion</h1>
            <p>This is to certify that</p>
          </div>

          <div className="cert-body">
            <div className="cert-name">{studentName}</div>
            <p>has successfully completed the course</p>
            <div className="cert-course">{course.courseTitle}</div>
            <p>demonstrating a commitment to continuous learning and professional development.</p>
          </div>

          <div className="cert-footer">
            <div className="cert-signature">
              <div className="cert-signature-line" style={{ fontFamily: 'Brush Script MT', fontSize: '2rem', color: '#1e293b' }}>Globix Admin</div>
              <p>Lead Instructor</p>
            </div>
            
            <div className="cert-seal">
              <Award size={48} />
            </div>

            <div className="cert-signature">
              <div className="cert-signature-line" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '0.25rem', fontFamily: 'Courier', fontSize: '1.2rem', color: '#475569' }}>
                {formattedDate}
              </div>
              <p>Date Awarded</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
