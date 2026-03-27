import React from 'react';
import Quiz from "../../components/layout/Quiz";  // Corrected import path

const QuizPage = ({ userId }) => {
  return (
    <div>
      <h2>Take the Quiz</h2>
      <Quiz userId={userId} />
    </div>
  );
};

export default QuizPage;
