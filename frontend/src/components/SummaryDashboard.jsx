import React, { useState } from 'react';
import { FileText, Cpu, BookOpen, Brain, Loader2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import KnowledgeGraph from './KnowledgeGraph';

const API_BASE = 'http://localhost:8000/api/v1';

export default function SummaryDashboard({ documents }) {
  const [selectedDoc, setSelectedDoc] = useState(documents[0] || null);
  const [activeView, setActiveView] = useState('summary'); // summary, flashcards, quiz, graph
  const [data, setData] = useState({ summary: '', flashcards: '', quiz: '', graph: null });
  const [isLoading, setIsLoading] = useState(false);

  const fetchContent = async (type) => {
    if (!selectedDoc) return;
    
    // Check cache
    if (data[type]) {
      setActiveView(type);
      return;
    }

    setIsLoading(true);
    setActiveView(type);
    
    try {
      const formData = new FormData();
      formData.append('filename', selectedDoc);
      
      let endpoint = '';
      if (type === 'summary') {
        endpoint = '/summarize';
      } else if (type === 'graph') {
        endpoint = '/generate-graph';
      } else {
        endpoint = '/generate-study';
        formData.append('type', type);
      }

      const response = await axios.post(`${API_BASE}${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      let resultData = response.data.summary || response.data.result;
      if (type === 'graph' && typeof resultData === 'string') {
        try {
            resultData = JSON.parse(resultData);
        } catch(e) {
            console.error("Failed to parse graph data:", e);
        }
      }

      setData(prev => ({
        ...prev,
        [type]: resultData
      }));

    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setData(prev => ({ ...prev, [type]: `Failed to generate ${type}. Please ensure backend and AI are running.` }));
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically fetch summary if document changes
  React.useEffect(() => {
    if (selectedDoc && !data.summary) {
      fetchContent('summary');
    }
  }, [selectedDoc]);

  if (documents.length === 0) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: '50%', marginBottom: '24px' }}>
          <Brain size={48} color="var(--accent-primary)" />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Knowledge Graph is Empty</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Upload documents to generate summaries, flashcards, and quizzes.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* Header & Controls */}
      <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Knowledge Graph</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>AI-generated insights from your documents.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={selectedDoc || ''} 
            onChange={(e) => {
              setSelectedDoc(e.target.value);
              setData({ summary: '', flashcards: '', quiz: '' });
            }}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-md)', 
              backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              color: 'var(--text-primary)', outline: 'none', cursor: 'pointer'
            }}
          >
            {documents.map(doc => (
              <option key={doc} value={doc}>{doc}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Sidebar Tools */}
        <div style={{ width: '220px', borderRight: '1px solid var(--border-color)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px' }}>
            Analysis Tools
          </div>
          
          <button 
            onClick={() => fetchContent('summary')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', 
              borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              backgroundColor: activeView === 'summary' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeView === 'summary' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}
          >
            <FileText size={18} /> Overview
          </button>
          
          <button 
             onClick={() => fetchContent('flashcards')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', 
              borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              backgroundColor: activeView === 'flashcards' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeView === 'flashcards' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}
          >
            <BookOpen size={18} /> Flashcards
          </button>
          
          <button 
             onClick={() => fetchContent('quiz')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', 
              borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              backgroundColor: activeView === 'quiz' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeView === 'quiz' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}
          >
            <Cpu size={18} /> AI Quiz
          </button>

          <button 
             onClick={() => fetchContent('graph')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', 
              borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              backgroundColor: activeView === 'graph' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeView === 'graph' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}
          >
            <Brain size={18} /> Mind Map
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: 'var(--text-secondary)' }}
              >
                <Loader2 size={32} className="spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
                <p>Analyzing document...</p>
                <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 100% { transform: rotate(360deg); } }`}} />
              </motion.div>
            ) : (
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="glass-panel"
                style={{ 
                  padding: '40px', 
                  maxWidth: '900px', 
                  margin: '0 auto', 
                  fontSize: '1rem', 
                  lineHeight: '1.8', 
                  whiteSpace: 'pre-wrap',
                  color: 'var(--text-primary)',
                  minHeight: '60vh'
                }}
              >
                {!data[activeView] ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '64px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ opacity: 0.5 }}><Brain size={48} /></div>
                    <p>Select an analysis tool from the left menu to begin digging into your document.</p>
                  </div>
                ) : activeView === 'graph' ? (
                  <div style={{ width: '100%', height: '600px', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <KnowledgeGraph data={data.graph} />
                  </div>
                ) : (
                  <div className="content-render">
                    {/* Add a nice header for the specific tool */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                        {activeView === 'summary' && <><FileText className="text-accent" /> <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Executive Summary</h3></>}
                        {activeView === 'flashcards' && <><BookOpen className="text-accent" /> <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Flashcards</h3></>}
                        {activeView === 'quiz' && <><Cpu className="text-accent" /> <h3 style={{ margin: 0, fontSize: '1.5rem' }}>AI Quiz</h3></>}
                    </div>
                    {data[activeView]}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
