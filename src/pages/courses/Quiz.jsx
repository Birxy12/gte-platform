import { useState, useEffect, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Award, Clock, ChevronLeft, ChevronRight, Flag, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import "./Quiz.css";

export default function Quiz({ course, quiz: preloadedQuiz, onComplete, onClose }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(true);

  // Fallback mock questions
  const mockQuestions = [
    {
      question: `What is the primary goal of "${course.title}"?`,
      options: ["Master theory", "Practical experience", "Graduation", "Both A and B"],
      correct: 3
    },
    {
      question: "Which component is most critical in this mission?",
      options: ["Encryption", "UI Principles", "State Management", "Infrastructure"],
      correct: 1
    },
    {
      question: "How should you approach the final project?",
      options: ["Work alone", "Collaborate", "Templates only", "Skip planning"],
      correct: 1
    },
    ...Array.from({ length: 27 }, (_, i) => ({
      question: `CBT Proficiency Question ${i + 4}: How does indexing affect query performance in this environment?`,
      options: ["Slows it down", "Optimizes retrieval", "No effect", "Increases storage costs"],
      correct: 1
    }))
  ];

  // Fetch quiz from Firestore by courseId (or use preloaded quiz)
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoadingQuiz(true);
      try {
        // If a specific quiz was passed in, use it
        if (preloadedQuiz && preloadedQuiz.questions && preloadedQuiz.questions.length > 0) {
          setQuestions(preloadedQuiz.questions);
          setLoadingQuiz(false);
          return;
        }
        const q = query(collection(db, "quizzes"), where("courseId", "==", course.id));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const quizData = snapshot.docs[0].data();
          if (quizData.questions && quizData.questions.length > 0) {
            setQuestions(quizData.questions);
            setLoadingQuiz(false);
            return;
          }
        }
        // No quiz found — use fallback
        setQuestions(mockQuestions);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setQuestions(mockQuestions);
      } finally {
        setLoadingQuiz(false);
      }
    };
    fetchQuiz();
  }, [course.id, preloadedQuiz]);

  const calculateScore = useCallback(() => {
    let finalScore = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) finalScore++;
    });
    setScore(finalScore);
    return finalScore;
  }, [answers, questions]);

  const handleFinish = useCallback(() => {
    const finalScore = calculateScore();
    setShowResult(true);
    // Always call onComplete with score and total so caller can save result
    onComplete(finalScore, questions.length || 30);
  }, [calculateScore, onComplete, questions.length]);

  useEffect(() => {
    if (!quizStarted || showResult) return;
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, showResult, handleFinish]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (index) => {
    setAnswers({ ...answers, [currentQuestion]: index });
  };

  const toggleReview = () => {
    setMarkedForReview(prev => 
      prev.includes(currentQuestion) 
        ? prev.filter(q => q !== currentQuestion) 
        : [...prev, currentQuestion]
    );
  };

  return (
    <div className="quiz-overlay">
      <div className="quiz-container">
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

      {loadingQuiz ? (
          <div className="flex flex-col items-center justify-center gap-6 p-20">
            <Loader2 size={48} className="text-blue-500 animate-spin" />
            <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">Loading Mission Intel...</p>
          </div>
        ) : !quizStarted ? (
          <div className="quiz-start-screen p-8 text-center bg-slate-900/50 rounded-2xl">
            <Clock size={64} className="mx-auto text-blue-500 mb-6 animate-pulse" />
            <h2 className="text-3xl font-black text-white mb-4 uppercase">CBT Mission Initialized</h2>
            <div className="space-y-4 mb-8 text-left max-w-md mx-auto bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircle size={20} className="text-green-500" />
                    <span>Total Questions: <strong>30</strong></span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                    <Clock size={20} className="text-blue-500" />
                    <span>Time Allowed: <strong>30 Minutes</strong></span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                    <AlertCircle size={20} className="text-yellow-500" />
                    <span>Passing Score: <strong>15/30 (50%)</strong></span>
                </div>
            </div>
            <p className="text-gray-400 text-sm mb-8">Ensure your connection is stable. Once started, the timer cannot be paused.</p>
            <button 
                onClick={() => setQuizStarted(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl text-lg tracking-widest transition-all shadow-lg shadow-blue-500/20"
            >
              COMMENCE TEST
            </button>
          </div>
        ) : !showResult ? (
          <>
            <div className="quiz-header !justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-bold mb-1">CBT HUD v2.0</span>
                <h2 className="text-xl font-bold text-white">Question {currentQuestion + 1}</h2>
              </div>
              <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${timeLeft < 300 ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-slate-800 border-slate-700 text-blue-400'}`}>
                <Clock size={20} />
                <span className="font-mono text-xl font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="question-section !bg-slate-900/30">
              <div className="question-text !mb-10 text-xl font-medium">
                {questions[currentQuestion].question}
              </div>
              <div className="options-grid">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-btn !py-5 ${answers[currentQuestion] === index ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(index)}
                  >
                    <span className="option-index !bg-slate-800">{String.fromCharCode(65 + index)}</span>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 mb-6 p-4 bg-slate-900/40 rounded-xl border border-slate-800">
                <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Navigation Palette</h4>
                <div className="flex flex-wrap gap-2">
                    {questions.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentQuestion(idx)}
                            className={`w-8 h-8 rounded-md text-xs font-bold transition-all flex items-center justify-center ${
                                currentQuestion === idx ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/40' : 
                                answers[idx] !== undefined ? 'bg-green-600/30 text-green-400 border border-green-500/30' :
                                markedForReview.includes(idx) ? 'bg-yellow-600/30 text-yellow-400 border border-yellow-500/30' :
                                'bg-slate-800 text-slate-500 border border-slate-700 hover:border-blue-500'
                            }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>

            <div className="quiz-footer">
              <div className="flex gap-2">
                <button 
                  className="p-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-20"
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${markedForReview.includes(currentQuestion) ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-gray-400'}`}
                  onClick={toggleReview}
                >
                    <Flag size={16} /> {markedForReview.includes(currentQuestion) ? "Unmark" : "Review"}
                </button>
              </div>

              <div className="flex gap-4">
                {currentQuestion + 1 < questions.length ? (
                    <button 
                        className="next-btn flex items-center gap-2"
                        onClick={() => setCurrentQuestion(prev => prev + 1)}
                    >
                        Save & Next <ChevronRight size={20} />
                    </button>
                ) : (
                    <button 
                        className="next-btn !bg-green-600 !hover:bg-green-700 shadow-lg shadow-green-500/20"
                        onClick={handleFinish}
                    >
                        Submit Mission
                    </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="result-section !bg-slate-950 !border-slate-800 p-10">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="result-icon !text-7xl mb-6">
              {score >= 15 ? "🎖️" : "📉"}
            </motion.div>
            <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Mission {score >= 15 ? "Accomplished" : "Failed"}</h2>
            <div className="result-score !text-5xl !text-blue-500 !font-black my-6">
              {score} / 30
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8 w-full text-center">
                <p className="text-gray-400 text-lg leading-relaxed">
                {score >= 15 
                    ? "Exceptional performance, Soldier. Your technical proficiency has been validated. The certificate has been drafted for your archives." 
                    : "Mission failure. Your results are below the required tactical proficiency for certification. Recalibrate and attempt the simulation again."}
                </p>
            </div>
            <button className="next-btn !w-full !py-5 !text-xl" onClick={onClose}>
              {score >= 15 ? "DOWNLOAD CERTIFICATE" : "RETURN TO BASE"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
