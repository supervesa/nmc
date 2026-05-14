import React from 'react';
import { NeonIcon } from './NeonIcon';

export const NeonSelect = ({ 
  label, 
  icon, 
  options = [], // Odottaa listaa muodossa: [{ value: 'julkinen', label: 'Julkinen' }, ...]
  className = '', 
  id,
  ...props 
}) => {
  
  const selectId = id || `neon-select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`form-group ${className}`} style={{ marginBottom: '16px' }}>
      {label && (
        <label htmlFor={selectId} style={{ color: 'var(--muted)', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
          {label}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        {/* Jos valikolla on ikoni, renderöidään se vasempaan reunaan */}
        {icon && (
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, pointerEvents: 'none', zIndex: 1 }}>
            <NeonIcon name={icon} size={18} />
          </div>
        )}
        
        <select 
          id={selectId}
          className="jc-select" 
          style={{ 
            paddingLeft: icon ? '40px' : '16px'
          }}
          {...props} 
        >
          {/* Jos et anna options-listaa, voit silti pudottaa normaaleja <option> -tägejä childreninä */}
          {options.length > 0 ? (
            options.map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))
          ) : (
            props.children
          )}
        </select>
      </div>
    </div>
  );
};