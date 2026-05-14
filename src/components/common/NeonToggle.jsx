import React from 'react';

export const NeonToggle = ({ 
  checked = false, 
  onChange, 
  label, 
  className = '', 
  ...props 
}) => {
  
  return (
    <label 
      className={`jc-toggle ${checked ? 'on' : ''} ${className}`} 
      style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
    >
      <div 
        className="track" 
        onClick={() => onChange && onChange(!checked)} 
        {...props}
      >
        <div className="knob"></div>
      </div>
      
      {label && (
        <span style={{ fontSize: '0.9rem', color: 'var(--cream)', fontWeight: checked ? '600' : '400', transition: 'all 0.3s' }}>
          {label}
        </span>
      )}
    </label>
  );
};