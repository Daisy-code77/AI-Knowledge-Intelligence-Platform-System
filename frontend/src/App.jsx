import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, MessageSquare, BrainCircuit, UploadCloud, Library, Share2, Trash2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

// Components
import UploadPanel from './components/UploadPanel';
import ChatInterface from './components/ChatInterface';
import SummaryDashboard from './components/SummaryDashboard';
import AuraBackground from './components/AuraBackground';

const API_BASE = 'http://localhost:8000/api/v1';

function App() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'knowledge' | 'upload'
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const response = await axios.get(`${API_BASE}/documents`);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadComplete = () => {
    fetchDocuments();
    setActiveTab('chat');
  };

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      <AuraBackground />

      {/* Sidebar Navigation */}
      <nav className="glass-panel" style={{ 
        width: '280px', 
        height: 'calc(100vh - 32px)',
        margin: '16px',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 20px',
        zIndex: 10,
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '48px', padding: '0 8px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, hsl(var(--accent-primary)), hsl(var(--accent-secondary)))', 
            padding: '10px', 
            borderRadius: '14px', 
            color: 'white',
            boxShadow: '0 8px 16px var(--accent-glow)'
          }}>
            <BrainCircuit size={26} />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.03em' }}>Notebook AI</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'hsl(var(--text-tertiary))', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', paddingLeft: '12px' }}>
            Workspace
          </div>
          
          <button 
            className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={18} />
            <span>Chat Assistant</span>
          </button>
          
          <button 
            className={`nav-btn ${activeTab === 'knowledge' ? 'active' : ''}`}
            onClick={() => setActiveTab('knowledge')}
          >
            <Library size={18} />
            <span>Knowledge Graph</span>
          </button>
          
          <button 
            className={`nav-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <UploadCloud size={18} />
            <span>Add Documents</span>
          </button>

          <button 
            className="nav-btn"
            onClick={() => alert("Collaboration link copied to clipboard!")}
          >
            <Share2 size={18} />
            <span>Share Project</span>
          </button>

          <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-subtle)', paddingTop: '32px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'hsl(var(--text-tertiary))', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', paddingLeft: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Sources ({documents.length})</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', maxHeight: '35vh', paddingRight: '4px' }}>
              {isLoadingDocs ? (
                <div style={{ padding: '12px', color: 'hsl(var(--text-tertiary))', fontSize: '0.85rem' }}>Loading...</div>
              ) : documents.length === 0 ? (
                <div style={{ padding: '12px', color: 'hsl(var(--text-tertiary))', fontSize: '0.85rem', fontStyle: 'italic' }}>No sources added yet.</div>
              ) : (
                documents.map((doc, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i} 
                    className="source-item" 
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '10px', 
                      padding: '10px 12px', borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem', color: 'hsl(var(--text-secondary))',
                      justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                      <FileText size={14} style={{ flexShrink: 0, color: 'hsl(var(--accent-primary))' }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc}</span>
                    </div>
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete ${doc}?`)) {
                          try {
                            await axios.delete(`${API_BASE}/documents/${doc}`);
                            fetchDocuments();
                          } catch (err) {
                            alert("Failed to delete document");
                          }
                        }
                      }}
                      className="delete-doc-btn"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: '16px 16px 16px 0' }}>
        <div className="glass-panel" style={{ height: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ height: '100%' }}
            >
              {activeTab === 'chat' && <ChatInterface documents={documents} />}
              {activeTab === 'knowledge' && <SummaryDashboard documents={documents} />}
              {activeTab === 'upload' && <UploadPanel onUploadSuccess={handleUploadComplete} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .nav-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          background: transparent;
          border: 1px solid transparent;
          color: hsl(var(--text-secondary));
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s var(--ease-premium);
          text-align: left;
        }
        .nav-btn:hover {
          background: rgba(255,255,255,0.04);
          color: hsl(var(--text-primary));
          border-color: var(--border-subtle);
          padding-left: 20px;
        }
        .nav-btn.active {
          background: hsla(var(--accent-primary), 0.12);
          color: hsl(var(--accent-primary));
          border-color: hsla(var(--accent-primary), 0.2);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .delete-doc-btn {
          background: transparent; border: none; color: hsl(var(--text-tertiary)); 
          cursor: pointer; padding: 6px; display: flex; alignItems: center;
          border-radius: 6px; transition: all 0.2s;
        }
        .delete-doc-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .source-item:hover {
          border-color: var(--border-medium);
          background: rgba(255,255,255,0.05);
        }
      `}} />
    </div>
  );
}

export default App;
