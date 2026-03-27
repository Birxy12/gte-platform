import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Firebase setup
import { doc, getDoc } from 'firebase/firestore';

const ProgressBar = ({ userId }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchUserProgress = async () => {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const totalCourses = userData.progress.courses_completed.length;
        const totalQuizzes = userData.progress.quiz_scores.length;
        const completedCourses = totalCourses;
        const completedQuizzes = userData.progress.quiz_scores.filter(score => score >= 50).length; // Pass criteria

        setProgress((completedCourses + completedQuizzes) / (totalCourses + totalQuizzes) * 100);
      }
    };
    fetchUserProgress();
  }, [userId]);

  return (
    <div>
      <h3>Your Progress</h3>
      <div style={{ width: '100%', height: '30px', backgroundColor: '#e0e0e0' }}>
        <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'green' }} />
      </div>
      <p>{Math.round(progress)}%</p>
    </div>
  );
};

export default ProgressBar;
