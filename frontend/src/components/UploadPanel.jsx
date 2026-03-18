import React, { useState, useCallback } from 'react';
import { UploadCloud, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

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
      // Upload files sequentially to avoid overwhelming local backend
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
    <div style={{ height: '100%', padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
      
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px', fontWeight: '600' }}>Add Knowledge Sources</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Upload your documents to create a personalized AI knowledge base. 
          We currently support PDF, TXT, and DOCX files.
        </p>
      </div>

      <div 
        className="glass-panel"
        style={{
          maxWidth: '600px',
          width: '100%',
          padding: '48px',
          textAlign: 'center',
          border: isDragging ? '2px dashed var(--accent-primary)' : '2px dashed var(--border-color)',
          backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'rgba(20, 20, 23, 0.7)',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
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
        
        <div style={{ background: 'var(--bg-tertiary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <UploadCloud size={32} color="var(--accent-primary)" />
        </div>
        
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Click to upload or drag and drop</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>PDF, DOCX, or TXT (max. 10MB per file)</p>
      </div>

      {errorMessage && (
        <div style={{ marginTop: '16px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      {files.length > 0 && (
        <div style={{ maxWidth: '600px', width: '100%', marginTop: '32px' }}>
          <h4 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: '500' }}>Selected Files ({files.length})</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <AnimatePresence>
              {files.map((file, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={`${file.name}-${idx}`} 
                  className="glass-panel"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <File size={20} color="var(--accent-primary)" />
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{file.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleUpload}
              disabled={uploadStatus === 'uploading'}
              style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
            >
              {uploadStatus === 'idle' && 'Process & Analyze Documents'}
              {uploadStatus === 'uploading' && <><Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>}
              {uploadStatus === 'success' && <><CheckCircle size={18} /> Processed Successfully!</>}
            </button>
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}} />
          </div>
        </div>
      )}
    </div>
  );
}
