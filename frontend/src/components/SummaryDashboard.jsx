import React, { useState } from 'react';
import { FileText, Cpu, BookOpen, Brain, Loader2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import KnowledgeGraph from './KnowledgeGraph';
import emptyStateImage from '../assets/empty_state.png';

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

  React.useEffect(() => {
    if (selectedDoc && !data.summary) {
      fetchContent('summary');
    }
  }, [selectedDoc]);

  if (documents.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ padding: '48px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      >
        <img src={emptyStateImage} alt="Empty Knowledge Base" style={{ width: '280px', height: 'auto', marginBottom: '32px', filter: 'drop-shadow(0 0 20px var(--accent-glow))' }} />
        <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '12px', fontWeight: '800' }}>Knowledge Graph is Empty</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.1rem', maxWidth: '500px' }}>
          Upload documents to allow our AI to synthesize and visualize your personal knowledge network.
        </p>
      </motion.div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'transparent' }}>
      
      {/* Header & Controls */}
      <div style={{ padding: '24px 40px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: '700' }}>Knowledge Network</h2>
          <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-tertiary))' }}>Deep analysis and visualization of your data.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={selectedDoc || ''} 
            onChange={(e) => {
              setSelectedDoc(e.target.value);
              setData({ summary: '', flashcards: '', quiz: '', graph: null });
            }}
            className="glass-panel"
            style={{
              padding: '10px 24px', borderRadius: 'var(--radius-md)', 
              backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-medium)',
              color: 'hsl(var(--text-primary))', outline: 'none', cursor: 'pointer',
              fontWeight: '600', fontSize: '0.9rem'
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
        <div style={{ width: '260px', borderRight: '1px solid var(--border-subtle)', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'hsl(var(--text-tertiary))', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', paddingLeft: '12px' }}>
            Analysis Engine
          </div>
          
          {[
            { id: 'summary', icon: FileText, label: 'Executive Summary' },
            { id: 'flashcards', icon: BookOpen, label: 'Smart Flashcards' },
            { id: 'quiz', icon: Cpu, label: 'Cognitive Quiz' },
            { id: 'graph', icon: Brain, label: 'Neural Map' }
          ].map(tool => (
            <button 
              key={tool.id}
              onClick={() => fetchContent(tool.id)}
              className={`analysis-btn ${activeView === tool.id ? 'active' : ''}`}
            >
              <tool.icon size={18} />
              <span>{tool.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '24px', color: 'hsl(var(--text-secondary))' }}
              >
                <div style={{ padding: '20px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-medium)' }}>
                  <Loader2 size={40} className="spin" style={{ color: 'hsl(var(--accent-primary))' }} />
                </div>
                <p style={{ fontWeight: '600', letterSpacing: '0.02em' }}>Synthesizing knowledge...</p>
              </motion.div>
            ) : (
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="glass-panel"
                style={{ 
                  padding: '48px', 
                  maxWidth: '900px', 
                  margin: '0 auto', 
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  minHeight: '60vh'
                }}
              >
                {!data[activeView] ? (
                  <div style={{ textAlign: 'center', color: 'hsl(var(--text-tertiary))', padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                    <div style={{ opacity: 0.3, background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '24px' }}>
                        <Brain size={64} />
                    </div>
                    <p style={{ fontSize: '1.1rem', maxWidth: '400px' }}>Select an analysis dimension from the left to explore this document's latent knowledge.</p>
                  </div>
                ) : activeView === 'graph' ? (
                  <div style={{ width: '100%', height: '600px', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-medium)' }}>
                    <KnowledgeGraph data={data.graph} />
                  </div>
                ) : (
                  <div className="markdown-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div style={{ background: 'hsla(var(--accent-primary), 0.1)', padding: '10px', borderRadius: '12px' }}>
                            {activeView === 'summary' && <FileText className="text-accent" />}
                            {activeView === 'flashcards' && <BookOpen className="text-accent" />}
                            {activeView === 'quiz' && <Cpu className="text-accent" />}
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                            {activeView === 'summary' && 'Executive Summary'}
                            {activeView === 'flashcards' && 'Smart Flashcards'}
                            {activeView === 'quiz' && 'Cognitive Quiz'}
                        </h3>
                    </div>
                    {data[activeView]}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .analysis-btn {
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
        .analysis-btn:hover {
          background: rgba(255,255,255,0.04);
          color: hsl(var(--text-primary));
          border-color: var(--border-subtle);
          padding-left: 20px;
        }
        .analysis-btn.active {
          background: hsla(var(--accent-primary), 0.12);
          color: hsl(var(--accent-primary));
          border-color: hsla(var(--accent-primary), 0.2);
        }
      `}} />
    </div>
  );
}
