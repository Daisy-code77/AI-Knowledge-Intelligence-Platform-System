import React from 'react';

const AuraBackground = () => {
  return (
    <div className="aura-container">
      <div className="aura-blob"></div>
      <div className="aura-blob"></div>
      <div className="aura-blob" style={{ 
        width: '700px', 
        height: '700px', 
        background: 'radial-gradient(circle, hsla(280, 80%, 60%, 0.12) 0%, transparent 70%)',
        left: '40%',
        top: '20%',
        animationDuration: '18s',
        animationDelay: '-2s'
      }}></div>
      <div className="aura-blob" style={{ 
        width: '450px', 
        height: '450px', 
        background: 'radial-gradient(circle, hsla(200, 90%, 50%, 0.1) 0%, transparent 70%)',
        right: '15%',
        bottom: '20%',
        animationDuration: '22s',
        animationDelay: '-8s'
      }}></div>
    </div>
  );
};

export default AuraBackground;
