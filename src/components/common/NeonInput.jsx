import React from 'react';
import { NeonIcon } from './NeonIcon';

export const NeonInput = ({ 
  label, 
  error, 
  icon, 
  type = 'text', 
  className = '', 
  id,
  ...props 
}) => {
  
  const inputId = id || `neon-input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`form-group ${className}`} style={{ marginBottom: '16px' }}>
      {label && (
        <label htmlFor={inputId} style={{ color: 'var(--muted)', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
          {label}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        {/* Jos inputilla on ikoni, renderöidään se vasempaan reunaan */}
        {icon && (
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, pointerEvents: 'none' }}>
            <NeonIcon name={icon} size={18} />
          </div>
        )}
        
        <input 
          id={inputId}
          type={type} 
          className="jc-input" 
          style={{ 
            paddingLeft: icon ? '40px' : '12px',
            borderColor: error ? 'var(--magenta)' : 'rgba(0, 231, 255, 0.2)',
            boxShadow: error ? '0 0 10px rgba(255, 0, 229, 0.2)' : 'none'
          }}
          {...props} 
        />
      </div>

      {/* Virheilmoitus (Neon Punainen/Magenta) */}
      {error && (
        <div style={{ color: 'var(--magenta)', fontSize: '0.8rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <NeonIcon name="alert" size={14} color="var(--magenta)" glow="magenta" />
          {error}
        </div>
      )}
    </div>
  );
};