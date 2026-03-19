import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Info, Mic, MicOff, Volume2 } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:8000/api/v1';

export default function ChatInterface({ documents }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hello! I'm your knowledge assistant. I can answer questions about the documents you've uploaded. What would you like to know?",
      citations: []
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? " " : "") + transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch(e) {
            console.error(e);
        }
      } else {
        alert("Your browser does not support Speech Recognition.");
      }
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Your browser does not support Text-to-Speech.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (documents.length === 0) {
      setMessages(prev => [...prev, 
        { role: 'user', text: input },
        { role: 'ai', text: "Please upload some documents first before asking questions.", citations: [] }
      ]);
      setInput('');
      return;
    }

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('query', userMessage);

      const response = await axios.post(`${API_BASE}/chat`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const answerText = response.data.answer;
      setMessages(prev => [...prev, {
        role: 'ai',
        text: answerText,
        citations: response.data.citations || []
      }]);
      // Optional: Auto-read response
      // speakText(answerText);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: "I encountered an error trying to answer your question. Please ensure the backend server is running and your API key is configured.",
        citations: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'transparent' }}>
      
      {/* Header */}
      <div style={{ padding: '24px 40px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: '700' }}>Knowledge Chat</h2>
          <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-tertiary))', marginTop: '4px' }}>
            Interacting with your {documents.length} knowledge source(s).
          </p>
        </div>
      </div>
 
      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              key={idx} 
              style={{ display: 'flex', gap: '20px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
            >
              
              {/* Avatar */}
              <div style={{ 
                width: '42px', height: '42px', borderRadius: '14px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: msg.role === 'user' ? 'var(--bg-surface-light)' : 'linear-gradient(135deg, hsl(var(--accent-primary)), hsl(var(--accent-secondary)))',
                color: 'white',
                boxShadow: msg.role === 'ai' ? '0 8px 16px var(--accent-glow)' : 'none',
                marginTop: '4px'
              }}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
 
              {/* Message Content */}
              <div style={{ 
                maxWidth: '80%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div className="glass-panel" style={{ 
                  padding: '20px 24px', 
                  backgroundColor: msg.role === 'user' ? 'hsla(var(--accent-primary), 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: msg.role === 'user' ? '1px solid hsla(var(--accent-primary), 0.3)' : '1px solid var(--border-medium)',
                  borderRadius: msg.role === 'user' ? '24px 4px 24px 24px' : '4px 24px 24px 24px',
                  fontSize: '1rem',
                  lineHeight: '1.75',
                  color: 'hsl(var(--text-primary))'
                }}>
                  <div className="markdown-content">
                    {msg.text}
                  </div>
                </div>
 
                {/* Citations block for AI */}
                {msg.role === 'ai' && msg.citations && msg.citations.length > 0 && (
                  <div style={{ marginTop: '16px', width: '100%' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'hsl(var(--text-tertiary))', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.05em' }}>
                      <Info size={12} /> Verified Sources
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {Array.from(new Set(msg.citations.map(c => c.source))).map((source, i) => (
                        <span key={i} style={{ 
                          fontSize: '0.75rem', padding: '6px 14px', 
                          backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', 
                          borderRadius: 'var(--radius-full)', color: 'hsl(var(--text-secondary))',
                          fontWeight: '500'
                        }}>
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {msg.role === 'ai' && (
                  <button 
                    onClick={() => speakText(msg.text)}
                    style={{ 
                      marginTop: '12px', background: 'none', border: 'none', 
                      color: 'hsl(var(--text-tertiary))', cursor: 'pointer', 
                      display: 'flex', alignItems: 'center', gap: '6px', 
                      fontSize: '0.75rem', fontWeight: '500', alignSelf: 'flex-start',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'hsl(var(--accent-primary))'}
                    onMouseLeave={(e) => e.target.style.color = 'hsl(var(--text-tertiary))'}
                  >
                    <Volume2 size={14} /> Read Response
                  </button>
                )}
              </div>
 
            </motion.div>
          ))}
 
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              style={{ display: 'flex', gap: '20px' }}
            >
               <div style={{ 
                width: '42px', height: '42px', borderRadius: '14px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, hsl(var(--accent-primary)), hsl(var(--accent-secondary)))', 
                color: 'white',
                boxShadow: '0 8px 16px var(--accent-glow)'
              }}>
                <Loader2 size={20} className="spin" />
              </div>
              <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '4px 24px 24px 24px', color: 'hsl(var(--text-secondary))', fontStyle: 'italic' }}>
                Consulting your knowledge base...
              </div>
            </motion.div>
          )}
 
          <div ref={messagesEndRef} />
        </div>
      </div>
 
      {/* Input Area */}
      <div style={{ padding: '32px 40px', borderTop: '1px solid var(--border-subtle)' }}>
        <form onSubmit={handleSend} style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={documents.length > 0 ? "Ask anything about your data..." : "Upload documents to unlock the assistant"}
              disabled={isLoading || documents.length === 0}
              style={{
                width: '100%',
                padding: '18px 120px 18px 28px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-medium)',
                color: 'hsl(var(--text-primary))',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s var(--ease-premium)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
              className="chat-input"
            />
            
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px' }}>
              <button 
                type="button"
                onClick={toggleListening}
                disabled={isLoading || documents.length === 0}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: isListening ? '#ef4444' : 'rgba(255,255,255,0.05)',
                  color: isListening ? 'white' : 'hsl(var(--text-secondary))',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: (documents.length > 0 && !isLoading) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s'
                }}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
 
              <button 
                type="submit"
                disabled={isLoading || !input.trim() || documents.length === 0}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: (input.trim() && !isLoading && documents.length > 0) ? 'linear-gradient(135deg, hsl(var(--accent-primary)), hsl(var(--accent-secondary)))' : 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: (input.trim() && !isLoading && documents.length > 0) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s',
                  boxShadow: (input.trim() && !isLoading && documents.length > 0) ? '0 4px 12px var(--accent-glow)' : 'none'
                }}
              >
                <Send size={20} style={{ marginLeft: '2px' }} />
              </button>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.75rem', color: 'hsl(var(--text-tertiary))', letterSpacing: '0.02em' }}>
            Notebook AI may produce inaccurate information. Always verify with source citations.
          </div>
        </form>
      </div>
 
      <style dangerouslySetInnerHTML={{__html: `
        .chat-input:focus {
          border-color: hsl(var(--accent-primary));
          background-color: rgba(255,255,255,0.05);
          box-shadow: 0 8px 32px rgba(0,0,0,0.2), 0 0 0 4px hsla(var(--accent-primary), 0.1);
        }
      `}} />
    </div>
  );
}
