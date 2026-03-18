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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Header */}
      <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Knowledge Chat</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Ask questions based on your {documents.length} uploaded document(s).
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              style={{ display: 'flex', gap: '16px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
            >
              
              {/* Avatar */}
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: msg.role === 'user' ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
                color: 'white'
              }}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>

              {/* Message Bubble + Citations */}
              <div style={{ 
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div className="glass-panel" style={{ 
                  padding: '16px 20px', 
                  backgroundColor: msg.role === 'user' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(28, 28, 33, 0.6)',
                  border: msg.role === 'user' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border-color)',
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                  whiteSpace: 'pre-wrap',
                  color: 'var(--text-primary)',
                  boxShadow: msg.role === 'user' ? '0 4px 12px rgba(99, 102, 241, 0.1)' : 'var(--shadow-md)'
                }}>
                  {msg.text}
                </div>

                {/* Citations block for AI */}
                {msg.role === 'ai' && msg.citations && msg.citations.length > 0 && (
                  <div style={{ marginTop: '12px', width: '100%' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Info size={12} /> Sources Used
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Deduplicate sources for pill badges */}
                      {Array.from(new Set(msg.citations.map(c => c.source))).map((source, i) => (
                        <span key={i} style={{ 
                          fontSize: '0.75rem', padding: '4px 10px', 
                          backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', 
                          borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)'
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
                    style={{ marginTop: '8px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', alignSelf: 'flex-start' }}
                  >
                    <Volume2 size={14} /> Read Aloud
                  </button>
                )}
              </div>

            </motion.div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', gap: '16px' }}>
               <div style={{ 
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'var(--accent-primary)', color: 'white'
              }}>
                <Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 100% { transform: rotate(360deg); } }`}} />
              </div>
              <div style={{ padding: '16px 20px', borderRadius: '16px', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: 'var(--text-secondary)' }}>
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div style={{ padding: '24px 32px', backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)' }}>
        <form onSubmit={handleSend} style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={documents.length > 0 ? "Ask a question about your documents..." : "Upload documents to start asking questions..."}
            disabled={isLoading || documents.length === 0}
            style={{
              width: '100%',
              padding: '16px 24px',
              paddingRight: '60px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim() || documents.length === 0}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: (input.trim() && !isLoading && documents.length > 0) ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (input.trim() && !isLoading && documents.length > 0) ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            <Send size={18} style={{ marginLeft: '2px' }} />
          </button>
          
          <button 
            type="button"
            onClick={toggleListening}
            disabled={isLoading || documents.length === 0}
            style={{
              position: 'absolute',
              right: '54px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: isListening ? '#ef4444' : 'transparent',
              color: isListening ? 'white' : 'var(--text-secondary)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (documents.length > 0 && !isLoading) ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          AI can make mistakes. Verify important information with the cited sources.
        </div>
      </div>

    </div>
  );
}
