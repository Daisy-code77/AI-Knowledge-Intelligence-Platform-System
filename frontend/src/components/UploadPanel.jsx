import React, { useState, useCallback } from 'react';
import { UploadCloud, File as FileIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import heroImage from '../assets/hero.png';

const API_BASE = 'http://localhost:8000/api/v1';

export default function UploadPanel({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (selectedFiles) => {
    const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.pdf', '.txt', '.docx'];
    
    const validFiles = Array.from(selectedFiles).filter(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      return validTypes.includes(file.type) || validExtensions.includes(extension);
    });

    if (validFiles.length < selectedFiles.length) {
      setErrorMessage("Some files were rejected. Only PDF, TXT, and DOCX are supported.");
    } else {
      setErrorMessage("");
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e) => {
    processFiles(e.target.files);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        await axios.post(`${API_BASE}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      setUploadStatus('success');
      setFiles([]);
      setTimeout(() => {
        setUploadStatus('idle');
        if(onUploadSuccess) onUploadSuccess();
      }, 2000);
      
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus('error');
      setErrorMessage("Failed to process documents. Is the backend running?");
    }
  };

  return (
    <div style={{ height: '100%', padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', backgroundColor: 'transparent' }}>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '800px', width: '100%', textAlign: 'center', marginBottom: '48px' }}
      >
        <img src={heroImage} alt="AI Knowledge" style={{ width: '240px', height: 'auto', marginBottom: '24px', filter: 'drop-shadow(0 0 30px var(--accent-glow))' }} />
        <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '12px', fontWeight: '800', letterSpacing: '-0.03em' }}>Expand Your Knowledge</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Upload your documents to create a neural bridge between your data and AI. 
          Universal support for PDF, TXT, and Word files.
        </p>
      </motion.div>

      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="glass-panel"
        style={{
          maxWidth: '700px',
          width: '100%',
          padding: '60px 40px',
          textAlign: 'center',
          borderRadius: 'var(--radius-lg)',
          border: isDragging ? '2px dashed hsl(var(--accent-primary))' : '2px dashed var(--border-medium)',
          backgroundColor: isDragging ? 'hsla(var(--accent-primary), 0.05)' : 'rgba(255, 255, 255, 0.02)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <input 
          id="file-upload" 
          type="file" 
          multiple 
          accept=".pdf,.txt,.docx" 
          style={{ display: 'none' }} 
          onChange={handleFileSelect}
        />
        
        <div style={{ 
          background: 'linear-gradient(135deg, hsla(var(--accent-primary), 0.1), hsla(var(--accent-secondary), 0.1))', 
          width: '80px', height: '80px', borderRadius: '24px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          margin: '0 auto 24px',
          boxShadow: isDragging ? '0 0 40px var(--accent-glow)' : 'none',
          transition: 'all 0.3s'
        }}>
          <UploadCloud size={40} className="text-accent" />
        </div>
        
        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', fontWeight: '700' }}>Drop your files here</h3>
        <p style={{ color: 'hsl(var(--text-tertiary))', fontSize: '0.95rem' }}>or click to browse your system (max 10MB/file)</p>
        
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ position: 'absolute', inset: 0, border: '4px solid hsl(var(--accent-primary))', borderRadius: 'var(--radius-lg)', pointerEvents: 'none' }}
          />
        )}
      </motion.div>

      {errorMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: '20px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '500', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px 20px', borderRadius: 'var(--radius-md)' }}
        >
          <AlertCircle size={18} />
          {errorMessage}
        </motion.div>
      )}

      {files.length > 0 && (
        <div style={{ maxWidth: '700px', width: '100%', marginTop: '40px' }}>
          <h4 style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '700', color: 'hsl(var(--text-secondary))' }}>Ready for Analysis ({files.length})</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <AnimatePresence>
              {files.map((file, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={`${file.name}-${idx}`} 
                  className="glass-panel"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'hsla(var(--accent-primary), 0.1)', padding: '8px', borderRadius: '10px' }}>
                      <FileIcon size={20} className="text-accent" />
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{file.name}</div>
                      <div style={{ color: 'hsl(var(--text-tertiary))', fontSize: '0.75rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', border: 'none', 
                      color: 'hsl(var(--text-tertiary))', cursor: 'pointer',
                      padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem',
                      fontWeight: '600', transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => (e.target.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.target.style.color = 'hsl(var(--text-tertiary))')}
                  >
                    Remove
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div style={{ marginTop: '32px' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleUpload}
              disabled={uploadStatus === 'uploading'}
              style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
            >
              {uploadStatus === 'idle' && 'Initialize AI Analysis'}
              {uploadStatus === 'uploading' && <><Loader2 size={20} className="spin" /> Processing Neural Data...</>}
              {uploadStatus === 'success' && <><CheckCircle size={20} /> Analysis Complete!</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
