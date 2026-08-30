import { useState, useEffect, useRef, useCallback } from "react";
import { Editor } from "@monaco-editor/react";
import { Play, RotateCcw, Terminal as TerminalIcon, FilePlus, X, Square, Save, Download, CheckSquare, Square as SquareIcon, Trash2, FolderOpen, ExternalLink } from "lucide-react";
import { 
  SandpackProvider, 
  SandpackPreview, 
  SandpackConsole,
  useActiveCode,
  useSandpack
} from "@codesandbox/sandpack-react";
import "./CodeEditorTab.css";

const REACT_SETUP = {
  dependencies: {
    "lucide-react": "latest",
    "framer-motion": "latest"
  }
};

function getLanguage(filePath) {
  if (!filePath) return "javascript";
  if (filePath.endsWith('.css')) return "css";
  if (filePath.endsWith('.html')) return "html";
  if (filePath.endsWith('.json')) return "json";
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) return "typescript";
  if (filePath.endsWith('.md')) return "markdown";
  if (filePath.endsWith('.py')) return "python";
  if (filePath.endsWith('.jsx')) return "javascript";
  return "javascript";
}

// Download file to disk
function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Menubar with Save, Save As, Auto Save
function EditorMenuBar({ autoSave, setAutoSave, onSave, onSaveAs, showTerminal, setShowTerminal }) {
  const [menuOpen, setMenuOpen] = useState(null); // 'file' | 'view' | null
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const menuItemStyle = {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '7px 16px', fontSize: '13px', color: '#ccc',
    cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none',
    transition: 'background 0.1s',
  };

  return (
    <div ref={menuRef} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1f1f1f', borderBottom: '1px solid #3c3c3c', flexShrink: 0, position: 'relative', zIndex: 10 }}>
      {/* File menu */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setMenuOpen(menuOpen === 'file' ? null : 'file')}
          style={{
            background: menuOpen === 'file' ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: 'none', color: '#ccc', fontSize: '13px', padding: '5px 12px',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { if (menuOpen !== 'file') e.currentTarget.style.background = 'transparent'; }}
        >
          File
        </button>
        {menuOpen === 'file' && (
          <div style={{
            position: 'absolute', top: '100%', left: 0,
            background: '#252526', border: '1px solid #3c3c3c',
            borderRadius: '4px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            minWidth: '220px', zIndex: 100,
          }}>
            <div
              style={menuItemStyle}
              onClick={() => { onSave(); setMenuOpen(null); }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Save size={14} />
              <span style={{ flex: 1 }}>Save</span>
              <span style={{ fontSize: '11px', color: '#666' }}>Ctrl+S</span>
            </div>
            <div
              style={menuItemStyle}
              onClick={() => { onSaveAs(); setMenuOpen(null); }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Download size={14} />
              <span style={{ flex: 1 }}>Save As...</span>
              <span style={{ fontSize: '11px', color: '#666' }}>Ctrl+Shift+S</span>
            </div>
            <div style={{ height: '1px', background: '#3c3c3c', margin: '4px 0' }} />
            <div
              style={{ ...menuItemStyle, color: autoSave ? '#60a5fa' : '#ccc' }}
              onClick={() => { setAutoSave(!autoSave); setMenuOpen(null); }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {autoSave ? <CheckSquare size={14} /> : <SquareIcon size={14} />}
              <span>Auto Save</span>
              {autoSave && <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#60a5fa', fontWeight: 600 }}>ON</span>}
            </div>
          </div>
        )}
      </div>

      {/* View menu */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setMenuOpen(menuOpen === 'view' ? null : 'view')}
          style={{
            background: menuOpen === 'view' ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: 'none', color: '#ccc', fontSize: '13px', padding: '5px 12px',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { if (menuOpen !== 'view') e.currentTarget.style.background = 'transparent'; }}
        >
          View
        </button>
        {menuOpen === 'view' && (
          <div style={{
            position: 'absolute', top: '100%', left: 0,
            background: '#252526', border: '1px solid #3c3c3c',
            borderRadius: '4px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            minWidth: '200px', zIndex: 100,
          }}>
            <div
              style={{ ...menuItemStyle, color: showTerminal ? '#60a5fa' : '#ccc' }}
              onClick={() => { setShowTerminal(!showTerminal); setMenuOpen(null); }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {showTerminal ? <CheckSquare size={14} /> : <SquareIcon size={14} />}
              <span style={{ flex: 1 }}>Toggle Terminal</span>
              <span style={{ fontSize: '11px', color: '#666' }}>Ctrl+`</span>
            </div>
          </div>
        )}
      </div>

      {/* Status indicators */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', paddingRight: '12px' }}>
        {autoSave && (
          <span style={{ fontSize: '11px', color: '#60a5fa', padding: '2px 8px', borderRadius: '10px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
            ● Auto Save
          </span>
        )}
      </div>
    </div>
  );
}

// Custom file tabs bar
function CustomTabs({ savedFiles, autoSave }) {
  const { sandpack } = useSandpack();
  const { files, activeFile, setActiveFile, closeFile } = sandpack;
  const openFiles = Object.keys(files).filter(f => !files[f].hidden);

  return (
    <div style={{
      display: 'flex',
      overflowX: 'auto',
      backgroundColor: '#252526',
      borderBottom: '1px solid #3c3c3c',
      scrollbarWidth: 'thin',
      flexShrink: 0
    }}>
      {openFiles.map((filePath) => {
        const isActive = filePath === activeFile;
        const fileName = filePath.split('/').pop();
        const isDirty = !autoSave && savedFiles && !savedFiles.has(filePath);
        return (
          <div
            key={filePath}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', cursor: 'pointer',
              backgroundColor: isActive ? '#1e1e1e' : 'transparent',
              borderBottom: isActive ? '2px solid #007acc' : '2px solid transparent',
              color: isActive ? '#ffffff' : '#969696',
              fontSize: '13px', whiteSpace: 'nowrap', userSelect: 'none',
              minWidth: '80px', transition: 'background-color 0.15s',
            }}
            onClick={() => setActiveFile(filePath)}
          >
            <span style={{ flex: 1 }}>
              {isDirty && <span style={{ color: '#e2b06a', marginRight: '4px', fontSize: '10px' }}>●</span>}
              {fileName}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isActive) {
                  const others = openFiles.filter(f => f !== filePath);
                  if (others.length > 0) setActiveFile(others[0]);
                }
                if (typeof closeFile === 'function') closeFile(filePath);
                else sandpack.deleteFile(filePath);
              }}
              title={`Close ${fileName}`}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: '2px', borderRadius: '3px', display: 'flex', alignItems: 'center', opacity: 0.6 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Monaco editor wired to Sandpack state, with save support
function SandpackMonacoEditor({ showPreview, setShowPreview, autoSave, onSave, onSaveAs }) {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();
  const { activeFile } = sandpack;
  const language = getLanguage(activeFile);
  const editorRef = useRef(null);

  // Handle Ctrl+S / Ctrl+Shift+S shortcuts
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (e.shiftKey) onSaveAs();
      else onSave();
    }
  }, [onSave, onSaveAs]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleChange = (value) => {
    const v = value ?? "";
    updateCode(v);
    if (autoSave) {
      // Auto-download is not ideal; instead just mark clean
      // Code is always synced to Sandpack virtual FS
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
      {/* Tabs + Run button bar */}
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#252526', borderBottom: '1px solid #3c3c3c', flexShrink: 0 }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <CustomTabs autoSave={autoSave} />
        </div>
        <div style={{ padding: '4px 10px', flexShrink: 0, display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={onSave}
            title="Save file (Ctrl+S)"
            className="editor-btn-secondary"
            style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Save size={12} /> Save
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="editor-btn-primary"
            style={{ whiteSpace: 'nowrap', padding: '5px 14px', fontSize: '12px' }}
          >
            {showPreview ? <><Square size={12} /> Stop</> : <><Play size={12} /> Run</>}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Editor
          key={activeFile}
          path={activeFile}
          height="100%"
          language={language}
          theme="vs-dark"
          defaultValue={code}
          onChange={handleChange}
          onMount={(editor) => { editorRef.current = editor; }}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: "on",
            glyphMargin: false,
            folding: true,
            minimap: { enabled: false },
            scrollbar: { vertical: 'visible', horizontal: 'visible', verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
            overviewRulerBorder: false,
            scrollBeyondLastLine: false,
            wordWrap: "off",
            automaticLayout: true,
            padding: { top: 12 },
            renderLineHighlight: 'all',
            cursorSmoothCaretAnimation: 'on',
          }}
        />
      </div>
    </div>
  );
}



// File Explorer sidebar
function CustomFileExplorer() {
  const { sandpack } = useSandpack();
  const { files, activeFile, setActiveFile } = sandpack;
  const [newFileName, setNewFileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleOpenFolder = async () => {
    try {
      if (!window.showDirectoryPicker) {
        alert("Your browser does not support the File System Access API. Please use a modern Chromium-based browser (Chrome, Edge).");
        return;
      }
      
      const dirHandle = await window.showDirectoryPicker();
      const newFiles = {};
      
      const processDirectory = async (handle, currentPath) => {
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            // Try to read as text. If it's a binary file, it might fail or show gibberish, but that's okay for a simple code editor
            try {
              const contents = await file.text();
              newFiles[`${currentPath}/${entry.name}`] = contents;
            } catch (e) {
              console.warn(`Could not read file: ${entry.name}`);
            }
          } else if (entry.kind === 'directory') {
            if (entry.name !== 'node_modules' && entry.name !== '.git') {
               await processDirectory(entry, `${currentPath}/${entry.name}`);
            }
          }
        }
      };

      await processDirectory(dirHandle, "");
      
      if (Object.keys(newFiles).length > 0) {
        // Clear existing files and load the new ones
        const resetObject = {};
        for (const [path, code] of Object.entries(newFiles)) {
          resetObject[path] = code;
        }
        
        // Use sandpack update files method (since resetAllFiles isn't directly exposed sometimes)
        // We will just add them.
        sandpack.updateFile(resetObject);
        // Set first file active
        sandpack.setActiveFile(Object.keys(resetObject)[0]);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Error opening folder:", err);
      }
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (newFileName.trim()) {
      const path = newFileName.startsWith('/') ? newFileName : `/${newFileName}`;
      sandpack.addFile(path, "");
      sandpack.setActiveFile(path);
      setNewFileName("");
      setIsCreating(false);
    }
  };

  const fileList = Object.keys(files).filter(f => !files[f].hidden);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#252526' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #3c3c3c', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Explorer</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={handleOpenFolder} title="Open Folder"
            style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', padding: '3px', borderRadius: '4px', display: 'flex' }}>
            <FolderOpen size={15} />
          </button>
          <button onClick={() => setIsCreating(!isCreating)} title="New File"
            style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', padding: '3px', borderRadius: '4px', display: 'flex' }}>
            <FilePlus size={15} />
          </button>
        </div>
      </div>
      {isCreating && (
        <form onSubmit={handleCreate} style={{ padding: '6px 8px', borderBottom: '1px solid #3c3c3c', flexShrink: 0 }}>
          <input
            type="text" value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setIsCreating(false)}
            placeholder="filename.ext" autoFocus
            style={{ width: '100%', padding: '4px 6px', fontSize: '12px', background: '#3c3c3c', border: '1px solid #007acc', color: '#fff', borderRadius: '3px', outline: 'none', boxSizing: 'border-box' }}
          />
        </form>
      )}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {fileList.map((filePath) => {
          const isActive = filePath === activeFile;
          const fileName = filePath.split('/').pop();
          return (
            <div key={filePath} onClick={() => setActiveFile(filePath)}
              style={{
                padding: '4px 12px', cursor: 'pointer',
                backgroundColor: isActive ? '#37373d' : 'transparent',
                color: isActive ? '#ffffff' : '#cccccc',
                fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', userSelect: 'none',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#2a2d2e'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span style={{ fontSize: '11px', opacity: 0.5 }}>📄</span>
              <span>{fileName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Inner Sandpack wrapper — has access to sandpack context
function SandpackEditorInner({ showPreview, setShowPreview, autoSave, showTerminal, setShowTerminal }) {
  const { sandpack } = useSandpack();

  const getCurrentCode = () => {
    const activeFile = sandpack.activeFile;
    return sandpack.files[activeFile]?.code ?? "";
  };

  const handleSave = useCallback(() => {
    const activeFile = sandpack.activeFile;
    const code = getCurrentCode();
    const fileName = activeFile.split('/').pop();
    downloadFile(fileName, code);
  }, [sandpack]);

  const handleSaveAs = useCallback(() => {
    const activeFile = sandpack.activeFile;
    const code = getCurrentCode();
    const defaultName = activeFile.split('/').pop();
    const newName = window.prompt("Save As — enter filename:", defaultName);
    if (newName && newName.trim()) {
      downloadFile(newName.trim(), code);
    }
  }, [sandpack]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Menubar */}
      <EditorMenuBar
        autoSave={autoSave.value}
        setAutoSave={autoSave.set}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        showTerminal={showTerminal}
        setShowTerminal={setShowTerminal}
      />

      {/* Main editor + preview area */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* File Explorer */}
        <div style={{ width: '200px', borderRight: '1px solid #3c3c3c', flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CustomFileExplorer />
        </div>

        {/* Editor column */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', height: '100%', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <SandpackMonacoEditor
              showPreview={showPreview}
              setShowPreview={setShowPreview}
              autoSave={autoSave.value}
              onSave={handleSave}
              onSaveAs={handleSaveAs}
            />

            {/* Preview panel */}
            {showPreview && (
              <div style={{ width: '45%', flexShrink: 0, borderLeft: '1px solid #3c3c3c', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ padding: '6px 10px', backgroundColor: '#252526', borderBottom: '1px solid #3c3c3c', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', color: '#aaa' }}>🌐 Preview</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => setShowPreview(false)} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', padding: '3px', borderRadius: '3px', display: 'flex', alignItems: 'center' }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <SandpackPreview showOpenInWindow={true} showOpenInCodeSandbox={false} style={{ height: '100%', width: '100%' }} />
                </div>
              </div>
            )}
          </div>

          {/* Terminal panel */}
          {showTerminal && (
            <div style={{ height: '220px', flexShrink: 0, borderTop: '1px solid #3c3c3c', display: 'flex', flexDirection: 'column', backgroundColor: '#0d1117', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '4px 12px', backgroundColor: '#161b22', borderBottom: '1px solid #3c3c3c', flexShrink: 0, gap: '4px' }}>
                <TerminalIcon size={12} style={{ color: '#64748b' }} />
                <span style={{ fontSize: '12px', color: '#94a3b8', flex: 1 }}>Terminal / Console</span>
                <button onClick={() => setShowTerminal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '3px', display: 'flex', borderRadius: '4px' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                  <X size={13} />
                </button>
              </div>
              <div style={{ flex: 1, overflow: 'auto' }}>
                <SandpackConsole resetOnPreviewRestart={true} showRestartButton={false} showClearControl={true} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CodeEditorTab() {
  const [environment, setEnvironment] = useState("react");
  const [showWebPreview, setShowWebPreview] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [autoSave, setAutoSave] = useState(false);

  // Python state
  const [pythonCode, setPythonCode] = useState("# Write Python code here\nprint('Hello from Pyodide!')\n");
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideInstance, setPyodideInstance] = useState(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  const [termLines, setTermLines] = useState([{ text: "Python 3 WASM terminal ready. Press Run to execute.", color: "#64748b" }]);

  // Ctrl+` toggle terminal
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setShowTerminal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (environment === 'python' && !window.pyodide && !isPyodideLoading && !pyodideInstance) {
      setIsPyodideLoading(true);
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
      script.onload = async () => {
        try {
          const originalDefine = window.define;
          window.define = undefined;
          const py = await window.loadPyodide();
          window.define = originalDefine;
          window.pyodide = py;
          setPyodideInstance(py);
          setTermLines(prev => [...prev, { text: "✓ Python environment ready.", color: "#34d399" }]);
        } catch (e) {
          console.error("Pyodide failed to load", e);
          setTermLines(prev => [...prev, { text: `✗ Failed to load Python: ${e.message}`, color: "#ef4444" }]);
        } finally {
          setIsPyodideLoading(false);
        }
      };
      document.head.appendChild(script);
    }
  }, [environment, isPyodideLoading, pyodideInstance]);

  const executePython = async () => {
    if (!pyodideInstance) return;
    setIsRunning(true);
    setOutput([]);
    setTermLines(prev => [...prev, { text: `$ python main.py`, color: "#60a5fa" }]);
    pyodideInstance.setStdout({ batched: (msg) => {
      setOutput(prev => [...prev, { type: 'log', message: msg }]);
      setTermLines(prev => [...prev, { text: msg, color: "#e2e8f0" }]);
    }});
    try {
      await pyodideInstance.runPythonAsync(pythonCode);
      setTermLines(prev => [...prev, { text: "Process exited with code 0", color: "#64748b" }]);
    } catch (err) {
      setOutput(prev => [...prev, { type: 'error', message: err.toString() }]);
      setTermLines(prev => [...prev, { text: err.toString(), color: "#ef4444" }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handlePythonSave = () => {
    downloadFile("main.py", pythonCode);
  };
  const handlePythonSaveAs = () => {
    const name = window.prompt("Save As — enter filename:", "main.py");
    if (name?.trim()) downloadFile(name.trim(), pythonCode);
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div>
          <h2 className="editor-title">Interactive Workspace</h2>
          <p className="editor-subtitle">Write, run, and test code directly in your browser.</p>
        </div>
        <div className="editor-actions">
          <select className="editor-lang-select" value={environment} onChange={(e) => setEnvironment(e.target.value)}>
            <option value="react">React (Vite)</option>
            <option value="vanilla">HTML / CSS / JS</option>
            <option value="python">Python 3</option>
          </select>
        </div>
      </div>

      <div className="editor-workspace" style={{ padding: 0, flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' }}>
        {environment === 'python' ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', gap: 0, border: '1px solid #3c3c3c', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#1e1e1e' }}>
            {/* Python menubar */}
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1f1f1f', borderBottom: '1px solid #3c3c3c', flexShrink: 0 }}>
              {[
                { label: 'Save', icon: <Save size={13} />, action: handlePythonSave, shortcut: 'Ctrl+S' },
                { label: 'Save As', icon: <Download size={13} />, action: handlePythonSaveAs, shortcut: 'Ctrl+Shift+S' },
              ].map(item => (
                <button key={item.label} onClick={item.action} title={item.shortcut}
                  style={{ background: 'transparent', border: 'none', color: '#ccc', fontSize: '12px', padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  {item.icon} {item.label}
                </button>
              ))}
              <button onClick={() => setShowTerminal(!showTerminal)} title="Toggle Terminal (Ctrl+`)"
                style={{ background: showTerminal ? 'rgba(96,165,250,0.15)' : 'transparent', border: 'none', color: showTerminal ? '#60a5fa' : '#ccc', fontSize: '12px', padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = showTerminal ? 'rgba(96,165,250,0.15)' : 'transparent'; }}>
                <TerminalIcon size={13} /> Terminal
              </button>
              <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', paddingRight: '12px', cursor: 'pointer', fontSize: '12px', color: autoSave ? '#60a5fa' : '#666', userSelect: 'none' }}>
                <input type="checkbox" checked={autoSave} onChange={e => setAutoSave(e.target.checked)} style={{ accentColor: '#3b82f6' }} />
                Auto Save
              </label>
            </div>

            {/* Python editor + console */}
            <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div className="pane-header" style={{ flexShrink: 0 }}>
                  <span className="pane-title">main.py</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setPythonCode("# Write Python code here\nprint('Hello from Pyodide!')\n")} className="editor-btn-secondary">
                      <RotateCcw size={13} /> Reset
                    </button>
                    <button onClick={executePython} disabled={isRunning || isPyodideLoading || !pyodideInstance} className="editor-btn-primary">
                      <Play size={13} /> {isRunning ? "Running..." : isPyodideLoading ? "Loading..." : "Run"}
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <Editor height="100%" language="python" theme="vs-dark" value={pythonCode}
                    onChange={(v) => {
                      setPythonCode(v ?? "");
                      if (autoSave) { /* code stays in state, download on explicit save */ }
                    }}
                    options={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", lineNumbers: "on", minimap: { enabled: false }, scrollbar: { vertical: 'visible', horizontal: 'visible' }, automaticLayout: true, padding: { top: 12 } }}
                  />
                </div>
              </div>
              <div style={{ width: '340px', flexShrink: 0, borderLeft: '1px solid #3c3c3c', display: 'flex', flexDirection: 'column' }}>
                <div className="pane-header" style={{ flexShrink: 0 }}>
                  <span className="pane-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><TerminalIcon size={13} /> Output</span>
                  <button onClick={() => setOutput([])} className="editor-btn-secondary" style={{ padding: '3px 8px', fontSize: '11px' }}>Clear</button>
                </div>
                <div className="console-output" style={{ flex: 1, overflowY: 'auto' }}>
                  {output.length === 0
                    ? <div style={{ opacity: 0.4, fontStyle: 'italic', padding: '10px', fontSize: '13px' }}>Ready. Press Run.</div>
                    : output.map((log, i) => (
                      <div key={i} style={{ color: log.type === 'error' ? '#ef4444' : '#e2e8f0', fontFamily: 'monospace', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: '#3b82f6', marginRight: '8px' }}>❯</span>
                        <span style={{ whiteSpace: 'pre-wrap' }}>{log.message}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Python terminal panel */}
            {showTerminal && (
              <div style={{ height: '180px', flexShrink: 0, borderTop: '1px solid #3c3c3c', display: 'flex', flexDirection: 'column', backgroundColor: '#0d1117' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '4px 12px', backgroundColor: '#161b22', borderBottom: '1px solid #3c3c3c', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', color: '#999', display: 'flex', alignItems: 'center', gap: '6px' }}><TerminalIcon size={12} /> Terminal</span>
                  <button onClick={() => { setTermLines([{ text: "Terminal cleared.", color: "#64748b" }]); }} style={{ marginLeft: '8px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '11px' }}>Clear</button>
                  <button onClick={() => setShowTerminal(false)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                    <X size={13} />
                  </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                  {termLines.map((line, i) => (
                    <div key={i} style={{ color: line.color, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{line.text}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // React / Vanilla
          <div style={{ height: '100%', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #3c3c3c', backgroundColor: '#1e1e1e', display: 'flex', flexDirection: 'column' }}>
            <SandpackProvider
              template={environment === 'react' ? 'react' : 'vanilla'}
              theme="dark"
              options={{ autorun: true }}
              customSetup={environment === 'react' ? REACT_SETUP : undefined}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
            >
              <SandpackEditorInner
                showPreview={showWebPreview}
                setShowPreview={setShowWebPreview}
                autoSave={{ value: autoSave, set: setAutoSave }}
                showTerminal={showTerminal}
                setShowTerminal={setShowTerminal}
              />
            </SandpackProvider>
          </div>
        )}
      </div>
    </div>
  );
}
