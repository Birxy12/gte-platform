import { useState, useRef } from "react";
import { db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { 
  FileText, Upload, Brain, Plus, Trash2, 
  Save, X, Check, AlertCircle, Download
} from "lucide-react";
import { openAiService } from "../../../services/openAiService";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("manual"); // manual, csv, ai
  const [quizInfo, setQuizInfo] = useState({ title: "", courseId: "" });
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correct: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // AI / CSV specific state
  const [inputText, setInputText] = useState("");
  const fileInputRef = useRef(null);

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correct: 0 }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIdx, oIdx, value) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].options[oIdx] = value;
    setQuestions(newQuestions);
  };

  // CSV Parsing
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const lines = content.split("\n").filter(line => line.trim());
      
      const parsedQuestions = lines.slice(1).map(line => {
        const parts = line.split(",").map(p => p.trim());
        if (parts.length < 6) return null;
        return {
          question: parts[0],
          options: [parts[1], parts[2], parts[3], parts[4]],
          correct: parseInt(parts[5]) || 0
        };
      }).filter(Boolean);

      if (parsedQuestions.length > 0) {
        setQuestions(parsedQuestions);
        setActiveTab("manual"); // Switch to manual to review
      } else {
        setError("Could not parse CSV. Please use the template format.");
      }
    };
    reader.readAsText(file);
  };

  // AI Parsing
  const handleAIParsing = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const parsed = await openAiService.parseQuizFromText(inputText);
      if (Array.isArray(parsed)) {
        setQuestions(parsed);
        setActiveTab("manual");
      }
    } catch (err) {
      setError("AI Parsing failed. Ensure your text is clear or try manual entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!quizInfo.title || !quizInfo.courseId) {
      setError("Please provide Mission Title and Course Intel.");
      return;
    }
    
    setLoading(true);
    try {
      await addDoc(collection(db, "quizzes"), {
        ...quizInfo,
        questions,
        createdAt: serverTimestamp(),
      });
      navigate("/admin/manage-quizzes");
    } catch (err) {
      setError("Failed to deploy quiz to mission archives.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Question,Option A,Option B,Option C,Option D,Correct Index (0-3)\nWhat is 2+2?,3,4,5,6,1";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "quiz_template.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-5xl mx-auto p-6 md:p-10"
    >
      <div className="ad-page-header">
        <div className="ad-header-title">
          <h1>Construct Mission Quiz</h1>
          <p>Deploy knowledge assessments via manual entry, data import, or AI analysis</p>
        </div>
        <button onClick={() => navigate("/admin/manage-quizzes")} className="text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-500 text-sm"
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Mode Selector */}
      <div className="ad-tab-container mb-8 self-start inline-flex">
        <button 
          onClick={() => setActiveTab("manual")}
          className={`ad-tab flex items-center gap-2 ${activeTab === 'manual' ? 'active' : ''}`}
        >
          <FileText size={16} /> Manual Form
        </button>
        <button 
          onClick={() => setActiveTab("csv")}
          className={`ad-tab flex items-center gap-2 ${activeTab === 'csv' ? 'active' : ''}`}
        >
          <Upload size={16} /> Data Import
        </button>
        <button 
          onClick={() => setActiveTab("ai")}
          className={`ad-tab flex items-center gap-2 ${activeTab === 'ai' ? 'active' : ''}`}
        >
          <Brain size={16} /> AI Intel Parse
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Mission Config */}
        <div className="lg:col-span-1 space-y-6">
          <div className="ad-card">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-widest">
               <Save size={16} className="text-blue-500" /> Mission Config
            </h3>
            <div className="space-y-4">
              <div>
                <label className="ad-label">Quiz Title</label>
                <input 
                  type="text" 
                  value={quizInfo.title}
                  onChange={e => setQuizInfo({...quizInfo, title: e.target.value})}
                  className="ad-input"
                  placeholder="e.g. Tactical Proficiency Exam"
                />
              </div>
              <div>
                <label className="ad-label">Linked Course (ID)</label>
                <input 
                  type="text" 
                  value={quizInfo.courseId}
                  onChange={e => setQuizInfo({...quizInfo, courseId: e.target.value})}
                  className="ad-input font-mono text-xs"
                  placeholder="Course ID from archives..."
                />
              </div>
              <button 
                onClick={handleSaveQuiz}
                disabled={loading}
                className="ad-btn-primary w-full py-4 mt-4"
              >
                {loading ? "DEPLOYING..." : "SAVE MISSION QUIZ"}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'csv' && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="ad-form-card border-dashed border-blue-500/30 bg-blue-500/5 p-6"
               >
                  <h4 className="text-blue-400 font-bold mb-2 text-sm uppercase tracking-widest">Import Tactics</h4>
                  <p className="ad-info-text mb-6">
                    Upload a standard CSV following our intelligence structure to bulk-load questions.
                  </p>
                  <button 
                    onClick={downloadTemplate}
                    className="w-full ad-btn-secondary flex items-center justify-center gap-2 mb-4 !py-3 !text-xs"
                  >
                    <Download size={14} /> Intelligence Template
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full ad-btn-primary !py-3 !text-sm"
                  >
                    Upload CSV Asset
                  </button>
                  <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
               </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Question Content */}
        <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {activeTab === 'manual' && (
                <motion.div 
                  key="manual"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {questions.map((q, qIdx) => (
                    <div key={qIdx} className="ad-card relative group !p-8">
                      <button 
                        onClick={() => removeQuestion(qIdx)}
                        className="absolute top-6 right-6 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="mb-8">
                        <label className="ad-label !text-blue-500">Intel {qIdx + 1}</label>
                        <input 
                          type="text" 
                          value={q.question}
                          onChange={e => updateQuestion(qIdx, "question", e.target.value)}
                          className="w-full bg-transparent border-b border-slate-800 text-xl font-bold py-2 focus:border-blue-500 outline-none text-white placeholder-slate-700"
                          placeholder="Enter mission question..."
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className={`flex items-center gap-3 p-4 rounded-xl transition-all ${q.correct === oIdx ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-900/50 border border-slate-800'}`}>
                             <button 
                              onClick={() => updateQuestion(qIdx, "correct", oIdx)}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${q.correct === oIdx ? 'bg-green-500 border-green-500 text-white' : 'border-slate-700 hover:border-slate-500'}`}
                             >
                               {q.correct === oIdx && <Check size={12} />}
                             </button>
                             <input 
                              type="text" 
                              value={opt}
                              onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                              className="bg-transparent border-none text-sm outline-none flex-1 text-white placeholder-slate-600"
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)}...`}
                             />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={addQuestion}
                    className="w-full py-10 border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-600 hover:text-blue-500 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-900 group-hover:bg-blue-500/10 flex items-center justify-center transition-all border border-slate-800 group-hover:border-blue-500/30">
                      <Plus size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Append Next Intel Card</span>
                  </button>
                </motion.div>
              )}

              {activeTab === 'ai' && (
                <motion.div 
                  key="ai"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="ad-card !p-8"
                >
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                     <Brain size={20} className="text-purple-500" /> AI Mission Intel Analysis
                  </h3>
                  <p className="ad-info-text mb-8">
                    Paste raw briefing text from your tactical documents. Our AI will automatically extract questions, options, and intelligence pointers.
                  </p>
                  <textarea 
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    className="ad-textarea min-h-[400px] mb-8 !bg-slate-950/50 !p-6 font-mono text-sm leading-relaxed"
                    placeholder="Paste briefing data here..."
                  />
                  <button 
                    onClick={handleAIParsing}
                    disabled={loading || !inputText}
                    className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black rounded-2xl tracking-[0.2em] transition-all shadow-xl shadow-purple-500/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                  >
                    {loading ? (
                       <>ANALYZING INTEL...</>
                    ) : (
                       <><Brain size={20} /> COMMENCE AI PARSE</>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

