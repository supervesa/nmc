import React from 'react';

export const NeonCard = ({ 
  children, 
  className = '', 
  hudCorners = false, // True = Piirtää Cyberpunk-kulmat kortin sisälle
  onClick,
  ...props 
}) => {
  return (
    <div 
      className={`glass-panel ${className}`} 
      onClick={onClick}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        padding: '24px', // Oletuspadding
        position: 'relative' // Tärkeä HUD-kulmille
      }}
      {...props}
    >
      {children}

      {/* Cyberpunk HUD -kulmat (renderöidään vain jos pyydetty) */}
      {hudCorners && (
        <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, opacity: 0.4 }}>
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '15px', height: '15px', borderTop: '2px solid var(--turquoise)', borderLeft: '2px solid var(--turquoise)' }}></div>
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '15px', height: '15px', borderBottom: '2px solid var(--turquoise)', borderRight: '2px solid var(--turquoise)' }}></div>
        </div>
      )}
    </div>
  );
};