import { useState } from "react";
import { X, CheckCircle, AlertCircle, Award } from "lucide-react";
import "./Quiz.css";

export default function Quiz({ course, onComplete, onClose }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  // Mock questions for demonstration
  // In a real app, these would come from the course document in Firestore
  const questions = [
    {
      question: `What is the primary goal of "${course.title}"?`,
      options: [
        "To master advanced theoretical concepts",
        "To gain practical, hands-on experience",
        "To fulfill a graduation requirement",
        "Both A and B"
      ],
      correct: 3
    },
    {
      question: "Which of the following is a key component mentioned in the modules?",
      options: [
        "Data Encryption Standards",
        "Responsive UI Principles",
        "Advanced State Management",
        "Cloud Infrastructure Optimization"
      ],
      correct: 1
    },
    {
      question: "How should you approach the final project in this course?",
      options: [
        "Work alone and follow instructions strictly",
        "Collaborate with peers and experiment",
        "Use third-party templates only",
        "Skip the planning phase"
      ],
      correct: 1
    }
  ];

  const handleOptionSelect = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const handleFinish = () => {
    const passed = score >= questions.length / 2;
    if (passed) {
      onComplete();
    }
    onClose();
  };

  return (
    <div className="quiz-overlay">
      <div className="quiz-container">
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        {!showResult ? (
          <>
            <div className="quiz-header">
              <h2>Course Quiz</h2>
              <p>{course.title}</p>
            </div>

            <div className="question-section">
              <div className="question-text">
                {questions[currentQuestion].question}
              </div>
              <div className="options-grid">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-btn ${
                      isAnswered && index === questions[currentQuestion].correct ? 'correct' : ''
                    } ${
                      isAnswered && selectedOption === index && index !== questions[currentQuestion].correct ? 'incorrect' : ''
                    } ${
                      selectedOption === index ? 'selected' : ''
                    }`}
                    onClick={() => handleOptionSelect(index)}
                    disabled={isAnswered}
                  >
                    <span className="option-index">{String.fromCharCode(65 + index)}</span>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="quiz-footer">
              <div className="progress-text">
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <button
                className="next-btn"
                onClick={handleNext}
                disabled={!isAnswered}
              >
                {currentQuestion + 1 === questions.length ? "Finish Quiz" : "Next Question"}
              </button>
            </div>
          </>
        ) : (
          <div className="result-section">
            <span className="result-icon">
              {score >= questions.length / 2 ? "🏆" : "📝"}
            </span>
            <div className="result-score">
              {score} / {questions.length}
            </div>
            <p className="result-msg">
              {score >= questions.length / 2 
                ? "Congratulations! You passed the quiz. Your certificate is ready!" 
                : "Good effort! Keep learning and try again to earn your certificate."}
            </p>
            <button className="next-btn" onClick={handleFinish}>
              {score >= questions.length / 2 ? "Claim Certificate" : "Go Back"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
