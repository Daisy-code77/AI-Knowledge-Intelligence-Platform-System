import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, MessageSquare, BrainCircuit, UploadCloud, Library, Share2 } from 'lucide-react';
import axios from 'axios';
import './index.css';

// Components (We will create these next)
import UploadPanel from './components/UploadPanel';
import ChatInterface from './components/ChatInterface';
import SummaryDashboard from './components/SummaryDashboard';

const API_BASE = 'http://localhost:8000/api/v1';

function App() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'knowledge' | 'upload'
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  // Fetch available documents on load
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
    <div className="app-container" style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Sidebar Navigation */}
      <nav style={{ 
        width: '260px', 
        borderRight: '1px solid var(--border-color)', 
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
          <div style={{ background: 'var(--accent-primary)', padding: '8px', borderRadius: '12px', color: 'white' }}>
            <BrainCircuit size={24} />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em' }}>Notebook AI</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px' }}>
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

          <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', paddingLeft: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Sources ({documents.length})</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: '30vh' }}>
              {isLoadingDocs ? (
                <div style={{ padding: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading...</div>
              ) : documents.length === 0 ? (
                <div style={{ padding: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No sources added yet.</div>
              ) : (
                documents.map((doc, i) => (
                  <div key={i} style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    padding: '8px', borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem', color: 'var(--text-secondary)'
                  }}>
                    <FileText size={14} style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {activeTab === 'chat' && <ChatInterface documents={documents} />}
        {activeTab === 'knowledge' && <SummaryDashboard documents={documents} />}
        {activeTab === 'upload' && <UploadPanel onUploadSuccess={handleUploadComplete} />}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .nav-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        .nav-btn:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
        }
        .nav-btn.active {
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
        }
      `}} />
    </div>
  );
}

export default App;
