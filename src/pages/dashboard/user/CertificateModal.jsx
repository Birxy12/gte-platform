import React, { useRef } from 'react';
import { X, Download, Award } from 'lucide-react';
import './CertificateModal.css';

export default function CertificateModal({ course, profile, allCompleted = [], onClose }) {
  const certRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = course.completedAt?.toDate 
    ? course.completedAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const studentName = profile?.username || profile?.displayName || "Student";
  
  const regYear = profile?.createdAt?.toDate ? profile.createdAt.toDate().getFullYear() : new Date().getFullYear();
  const regNo = `GTE/${regYear}/${(profile?.uid || Math.random().toString(36).substring(2)).substring(0, 4).toUpperCase()}`;

  // Use allCompleted if available (Master Transcript), otherwise just the single course
  const coursesList = allCompleted.length > 0 ? allCompleted : [course];
  let totalScore = 0;
  let totalPossible = 0;

  coursesList.forEach(c => {
      totalScore += (c.score || 0);
      totalPossible += 30; // 30 is max score from Quiz
  });
  
  const averagePercent = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

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
          <div className="cert-watermark">GLOBIXTECH ACADEMY</div>
          
          <div className="cert-header">
            <h1 style={{ color: '#1e293b', fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>GLOBIXTECH ACADEMY</h1>
            <p style={{ marginTop: 0, fontWeight: 'bold', color: '#d4af37', letterSpacing: '2px', textTransform: 'uppercase' }}>Academic Excellence & Certification</p>
            <h2 style={{ fontSize: '2rem', marginTop: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Official Academic Transcript</h2>
          </div>

          <div className="cert-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '2rem', textAlign: 'left' }}>
               <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Student Name</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{studentName}</div>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Registration Number</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{regNo}</div>
               </div>
            </div>

            <p style={{ textAlign: 'left', marginBottom: '1rem', fontSize: '1.1rem' }}>This document verifies the completion of the following curriculum elements and their associated assessments:</p>
            
            <table className="cert-grade-table">
               <thead>
                  <tr>
                     <th>Course / Module Title</th>
                     <th style={{ textAlign: 'center' }}>Completion Date</th>
                     <th style={{ textAlign: 'right' }}>Grade</th>
                  </tr>
               </thead>
               <tbody>
                  {coursesList.map((c, i) => {
                      const cDate = c.completedAt?.toDate ? c.completedAt.toDate().toLocaleDateString('en-US') : formattedDate;
                      const cScore = c.score || 0;
                      const cPercent = Math.round((cScore / 30) * 100);
                      return (
                        <tr key={i}>
                           <td>{c.courseTitle || "Mission Assessment"}</td>
                           <td style={{ textAlign: 'center' }}>{cDate}</td>
                           <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{cPercent}% ({cScore}/30)</td>
                        </tr>
                      );
                  })}
               </tbody>
               <tfoot>
                  <tr>
                     <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>CUMULATIVE AVERAGE:</td>
                     <td style={{ textAlign: 'right', fontWeight: '900', color: '#10b981', fontSize: '1.2rem' }}>{averagePercent}%</td>
                  </tr>
               </tfoot>
            </table>

            <p style={{ fontSize: '0.9rem', color: '#475569', fontStyle: 'italic', marginTop: '2rem' }}>
              The student has demonstrated technical proficiency in the listed subjects. GlobixTech Academy officially honors their commitment to continuous learning.
            </p>
          </div>

          <div className="cert-footer">
            <div className="cert-signature flex flex-col items-center">
              <div className="cert-signature-line" style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '2.5rem', color: '#0f172a', borderBottom: '1px solid #cbd5e1' }}>A. Globix</div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold' }}>Academic Director</p>
            </div>
            
            <div className="cert-seal">
              <Award size={40} className="text-white" />
              <div style={{ fontSize: '0.5rem', fontWeight: '900', position: 'absolute', bottom: '15px' }}>SEAL</div>
            </div>

            <div className="cert-signature flex flex-col items-center">
              <div className="cert-signature-line" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '0.25rem', fontFamily: 'Courier, monospace', fontSize: '1.2rem', color: '#475569', borderBottom: '1px solid #cbd5e1' }}>
                {formattedDate}
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold' }}>Date Issued</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
