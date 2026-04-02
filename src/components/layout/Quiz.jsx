import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';

const Quiz = ({ userId }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const querySnapshot = await getDocs(collection(db, 'quizzes'));
      let quizzesArray = [];
      querySnapshot.forEach((doc) => {
        quizzesArray.push(doc.data());
      });
      setQuizzes(quizzesArray);
    };
    fetchQuizzes();
  }, []);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleSubmit = async () => {
    let userScore = 0;
    quizzes.forEach((quiz, index) => {
      if (answers[index] === quiz.correct_answer) {
        userScore += 1;
      }
    });

    setScore(userScore);
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'progress.quiz_scores': arrayUnion(userScore),
    });
  };

  return (
    <div>
      <h3>Quiz</h3>
      {quizzes.map((quiz, index) => (
        <div key={index}>
          <p>{quiz.question}</p>
          {quiz.options.map((option, i) => (
            <label key={i}>
              <input
                type="radio"
                name={`question-${index}`}
                value={option}
                onChange={() => handleAnswerChange(index, option)}
              />
              {option}
            </label>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit}>Submit Quiz</button>
      <p>Your Score: {score}</p>
    </div>
  );
};

export default Quiz;
