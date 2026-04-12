import { useState, useEffect, useCallback, Fragment } from "react";
import { db } from "../../../config/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  BarChart3, 
  Trash2, 
  Edit3, 
  Plus, 
  ExternalLink, 
  Shield,
  FileText,
  Video,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  FolderOpen
} from "lucide-react";

export default function ManageCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("modules"); // modules, create, materials, stats
  
  // Create course form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [instructor, setInstructor] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [annualPrice, setAnnualPrice] = useState("");
  const [coinCost, setCoinCost] = useState("100");
  const [category, setCategory] = useState("Beginner");
  const [parentCourseId, setParentCourseId] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [creating, setCreating] = useState(false);
  
  // Materials state
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [materialType, setMaterialType] = useState("pdf");
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");
  const [materialCoinCost, setMaterialCoinCost] = useState("0");
  const [materialFile, setMaterialFile] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      const data = await getDocs(collection(db, "courses"));
      setCourses(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this course and all its data?")) {
      try {
        await deleteDoc(doc(db, "courses", id));
        fetchCourses();
      } catch (err) {
        console.error("Error deleting course:", err);
      }
    }
  };

  const createCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await addDoc(collection(db, "courses"), {
        title: title.trim(),
        description: description.trim(),
        videoUrl: videoUrl.trim(),
        instructor: instructor.trim(),
        monthlyPrice: monthlyPrice.trim() || "0",
        annualPrice: annualPrice.trim() || "0",
        coinCost: parseInt(coinCost) || 100,
        category: category,
        parentCourseId: parentCourseId || null,
        thumbnailUrl: thumbnailUrl.trim() || "",
        enrolledCount: 0,
        materials: [],
        createdAt: serverTimestamp()
      });

      alert("Education course created successfully! 🎓");
      resetForm();
      setActiveTab("modules");
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Error creating course. Check console for details.");
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setInstructor("");
    setMonthlyPrice("");
    setAnnualPrice("");
    setCoinCost("100");
    setCategory("Beginner");
    setParentCourseId("");
    setThumbnailUrl("");
  };

  const addMaterial = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      alert("Please select a course first");
      return;
    }

    try {
      const courseRef = doc(db, "courses", selectedCourse.id);
      const newMaterial = {
        id: Date.now().toString(),
        type: materialType,
        title: materialTitle.trim(),
        url: materialUrl.trim(),
        coinCost: parseInt(materialCoinCost) || 0,
        addedAt: new Date().toISOString()
      };

      await updateDoc(courseRef, {
        materials: arrayUnion(newMaterial)
      });

      alert(`${materialType.toUpperCase()} material added successfully!`);
      setMaterialTitle("");
      setMaterialUrl("");
      setMaterialCoinCost("0");
      setMaterialFile(null);
      fetchCourses();
    } catch (err) {
      console.error("Error adding material:", err);
      alert("Failed to add material");
    }
  };

  const getMaterialIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText size={16} className="text-red-400" />;
      case 'docx': return <FileText size={16} className="text-blue-400" />;
      case 'video': return <Video size={16} className="text-purple-400" />;
      case 'project': return <FolderOpen size={16} className="text-green-400" />;
      default: return <FileText size={16} />;
    }
  };

  const getMaterialColor = (type) => {
    switch(type) {
      case 'pdf': return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'docx': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'video': return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      case 'project': return 'bg-green-500/10 border-green-500/20 text-green-400';
      default: return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    }
  };

  if (loading) return <div className="ad-card">Loading mission curriculum...</div>;

  return (
    <div className="ad-container">
      <div className="ad-page-header">
        <div className="ad-header-title">
          <h1>Course Command & Control</h1>
          <p>Organize, edit, create and curate the platform learning curriculum</p>
        </div>
      </div>

      <div className="ad-tab-container mb-8">
        <button 
          className={`ad-tab ${activeTab === 'modules' ? 'active' : ''}`}
          onClick={() => setActiveTab('modules')}
        >
          <BookOpen size={16} /> All Courses
        </button>
        <button 
          className={`ad-tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          <Plus size={16} /> Create Course
        </button>
        <button 
          className={`ad-tab ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          <Upload size={16} /> Add Materials
        </button>
        <button 
          className={`ad-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart3 size={16} /> Analytics
        </button>
      </div>

      <div className="ad-content-area">
        {/* ALL COURSES TAB */}
        {activeTab === 'modules' && (
          <div className="ad-card" style={{ padding: '0', marginTop: 0 }}>
            <div className="ad-table-wrapper">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Course Details</th>
                    <th>Instructor</th>
                    <th>Materials</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                        <BookOpen size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                        <p>No tactical modules found in the database.</p>
                        <button 
                          className="ad-btn-primary mt-4"
                          onClick={() => setActiveTab('create')}
                        >
                          <Plus size={16} /> Create First Course
                        </button>
                      </td>
                    </tr>
                  ) : (
                    courses.map(course => (
                      <Fragment key={course.id}>
                        <tr>
                          <td>
                            <div style={{ fontWeight: '700', color: 'white', marginBottom: '4px' }}>{course.title}</div>
                            <div className="flex items-center gap-2">
                              {course.parentCourseId && (
                                <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                  SUB-COURSE
                                </span>
                              )}
                              <span className="font-mono text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                {course.category}
                              </span>
                              <span className="text-[10px] text-slate-500 italic">
                                {course.coinCost > 0 ? `${course.coinCost} coins` : 'Free'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ color: '#fbbf24', fontWeight: '600' }}>{course.instructor}</div>
                          </td>
                          <td>
                            <span className="text-xs text-slate-400">
                              {course.materials?.length || 0} files
                            </span>
                          </td>
                          <td>
                            <span className="p-1 px-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] uppercase font-bold tracking-wider">
                              Active
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                              <button
                                onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                                className="ad-btn-secondary"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                title="View Materials"
                              >
                                {expandedCourse === course.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                              <button
                                onClick={() => navigate(`/admin/edit-course/${course.id}`)}
                                className="ad-btn-secondary"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                title="Edit Course"
                              >
                                <Edit3 size={14} />
                              </button>
                              <a
                                href={course.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ad-btn-secondary"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', color: '#60a5fa' }}
                                title="View Material"
                              >
                                <ExternalLink size={14} />
                              </a>
                              <button
                                onClick={() => handleDelete(course.id)}
                                className="ad-btn-danger"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                title="Delete Course"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedCourse === course.id && (
                          <tr>
                            <td colSpan="5" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem' }}>
                              <div className="space-y-2">
                                <h4 className="text-xs uppercase text-slate-500 font-bold mb-2">Course Materials</h4>
                                {course.materials?.length > 0 ? (
                                  course.materials.map(material => (
                                      <div 
                                        key={material.id}
                                        className={`flex items-center gap-3 p-2 rounded-lg border ${getMaterialColor(material.type)}`}
                                      >
                                        {getMaterialIcon(material.type)}
                                        <span className="text-sm font-medium flex-1">{material.title}</span>
                                        {material.coinCost > 0 && (
                                          <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded mr-2">
                                            {material.coinCost} Coins
                                          </span>
                                        )}
                                        <a 
                                        href={material.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs hover:underline"
                                      >
                                        <ExternalLink size={12} />
                                      </a>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-slate-500 italic">No materials added yet</p>
                                )}
                                <button
                                  className="ad-btn-primary mt-2"
                                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                  onClick={() => {
                                    setSelectedCourse(course);
                                    setActiveTab('materials');
                                  }}
                                >
                                  <Plus size={14} /> Add Material
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CREATE COURSE TAB */}
        {activeTab === 'create' && (
          <div className="ad-card">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <Plus className="text-amber-500" size={24} />
              <h3 className="text-xl font-bold text-white mb-0 mt-0">Create New Course</h3>
            </div>

            <form onSubmit={createCourse}>
              <div className="ad-form-grid">
                <div className="ad-field full">
                  <label>Course Title</label>
                  <input
                    placeholder="e.g. Advanced React Architecture"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="ad-field full">
                  <label>Detailed Description</label>
                  <textarea
                    placeholder="Explain what learners will gain from this course..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="6"
                    required
                  />
                </div>

                <div className="ad-field">
                  <label>Thumbnail Image URL</label>
                  <input
                    placeholder="https://... (leave blank for default)"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                  />
                </div>

                <div className="ad-field">
                  <label>Category / Level</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Programming</option>
                    <option>Design</option>
                    <option>Business</option>
                    <option>Marketing</option>
                    <option>Finance</option>
                  </select>
                </div>

                <div className="ad-field">
                  <label>Parent Course (Make this a Sub-Course)</label>
                  <select value={parentCourseId} onChange={(e) => setParentCourseId(e.target.value)}>
                    <option value="">-- None (Top Level Course) --</option>
                    {courses.filter(c => !c.parentCourseId).map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="ad-field full">
                  <label>Video / Resource URL</label>
                  <input
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="ad-field">
                  <label>Instructor Name</label>
                  <input
                    placeholder="e.g. Dr. Jane Smith"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    required
                  />
                </div>

                <div className="ad-field">
                  <label>🪙 Coin Cost (Vault Payment)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="100"
                    value={coinCost}
                    onChange={(e) => setCoinCost(e.target.value)}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem' }}>Set to 0 for free access</small>
                </div>

                <div className="ad-field">
                  <label>Monthly Price ($)</label>
                  <input
                    type="number"
                    placeholder="29"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                  />
                </div>

                <div className="ad-field">
                  <label>Annual Price ($)</label>
                  <input
                    type="number"
                    placeholder="19"
                    value={annualPrice}
                    onChange={(e) => setAnnualPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="ad-btn-row">
                <button type="submit" className="ad-btn-primary" disabled={creating}>
                  {creating ? "Creating..." : "✨ Create Course"}
                </button>
                <button type="button" className="ad-btn-secondary" onClick={() => setActiveTab('modules')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ADD MATERIALS TAB */}
        {activeTab === 'materials' && (
          <div className="ad-card">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <Upload className="text-amber-500" size={24} />
              <h3 className="text-xl font-bold text-white mb-0 mt-0">Add Course Materials</h3>
            </div>

            {/* Course Selector */}
            <div className="ad-field full mb-6">
              <label>Select Course</label>
              <select 
                value={selectedCourse?.id || ''}
                onChange={(e) => {
                  const course = courses.find(c => c.id === e.target.value);
                  setSelectedCourse(course || null);
                }}
                className="ad-input"
              >
                <option value="">-- Select a course --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title} - {course.instructor}
                  </option>
                ))}
              </select>
            </div>

            {selectedCourse && (
              <div className="mb-6 p-4 bg-slate-900/50 rounded-xl border border-amber-500/20">
                <p className="text-sm text-slate-400 mb-1">Adding materials to:</p>
                <p className="text-lg font-bold text-white">{selectedCourse.title}</p>
              </div>
            )}

            <form onSubmit={addMaterial}>
              <div className="ad-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="ad-field">
                  <label>Material Type</label>
                  <select 
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    className="ad-input"
                  >
                    <option value="pdf">📄 PDF Document</option>
                    <option value="docx">📝 Word Document (DOCX)</option>
                    <option value="video">🎥 Video File</option>
                    <option value="project">📁 Project Files</option>
                  </select>
                </div>

                <div className="ad-field">
                  <label>Material Title</label>
                  <input
                    type="text"
                    placeholder={`e.g. ${materialType === 'pdf' ? 'Lecture Notes' : materialType === 'video' ? 'Tutorial Video' : 'Project Template'}`}
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="ad-field">
                  <label>🪙 Coin Cost (Optional Vault Unlock)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 = Free within course"
                    value={materialCoinCost}
                    onChange={(e) => setMaterialCoinCost(e.target.value)}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    Setting > 0 individually charges users coins to access.
                  </small>
                </div>

                <div className="ad-field full">
                  <label>File URL (Google Drive, Dropbox, or direct link)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/... or https://..."
                    value={materialUrl}
                    onChange={(e) => setMaterialUrl(e.target.value)}
                    required
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    Paste a shareable link to your file. For Google Drive, use "Anyone with the link" permission.
                  </small>
                </div>
              </div>

              {/* Preview of material types */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {['pdf', 'docx', 'video', 'project'].map(type => (
                  <div 
                    key={type}
                    onClick={() => setMaterialType(type)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      materialType === type 
                        ? getMaterialColor(type) + ' ring-2 ring-offset-2 ring-offset-slate-900' 
                        : 'bg-slate-900/30 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {getMaterialIcon(type)}
                      <span className="text-xs font-bold uppercase">{type}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="ad-btn-row mt-8">
                <button 
                  type="submit" 
                  className="ad-btn-primary flex items-center gap-2"
                  disabled={!selectedCourse}
                >
                  <Upload size={18} /> Add Material
                </button>
                <button 
                  type="button" 
                  className="ad-btn-secondary"
                  onClick={() => {
                    setSelectedCourse(null);
                    setActiveTab('modules');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Quick guide */}
            <div className="mt-8 p-4 bg-slate-900/30 rounded-xl border border-white/5">
              <h4 className="text-sm font-bold text-slate-300 mb-2">📋 Supported Material Types:</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• <b>PDF</b> - Lecture notes, ebooks, documentation</li>
                <li>• <b>DOCX</b> - Editable worksheets, templates, guides</li>
                <li>• <b>Video</b> - Additional tutorials, walkthroughs, demos</li>
                <li>• <b>Project</b> - Source code, design files, practice projects</li>
              </ul>
            </div>
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="ad-card" style={{ marginTop: 0 }}>
              <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-bold">Total Enlistment</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">{courses.length}</span>
                <span className="text-slate-400 text-sm italic">Modules Active</span>
              </div>
            </div>
            
            <div className="ad-card" style={{ marginTop: 0 }}>
              <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-bold">Total Materials</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">
                  {courses.reduce((acc, c) => acc + (c.materials?.length || 0), 0)}
                </span>
                <span className="text-slate-400 text-sm italic">Files Uploaded</span>
              </div>
            </div>

            <div className="ad-card" style={{ marginTop: 0 }}>
              <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-bold">Infrastructure Health</h4>
              <div className="flex items-center gap-3 text-emerald-500">
                <Shield size={24} />
                <span className="font-bold">Sync Verified</span>
              </div>
            </div>

            <div className="ad-card col-span-1 md:col-span-3">
              <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-6 font-bold">Course Categories</h4>
              <div className="space-y-3">
                {['Beginner', 'Intermediate', 'Advanced', 'Programming', 'Design', 'Business'].map(cat => {
                  const count = courses.filter(c => c.category === cat).length;
                  const percentage = courses.length > 0 ? (count / courses.length) * 100 : 0;
                  return (
                    <div key={cat} className="flex items-center gap-4">
                      <span className="text-sm text-slate-400 w-24">{cat}</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-white font-bold w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
