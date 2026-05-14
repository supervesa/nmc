import React from 'react';
import { NeonIcon } from './NeonIcon';

export const NeonTag = ({ 
  type = 'julkinen', 
  label, 
  className = '',
  ...props 
}) => {
  
  const isRestricted = type !== 'julkinen';
  const iconName = isRestricted ? 'lock' : 'unlock';
  const themeClass = isRestricted ? 'restricted' : 'public';
  const displayText = label || type;

  return (
    <div 
      className={`security-tag ${themeClass} ${className}`} 
      {...props}
    >
      <NeonIcon 
        name={iconName} 
        size={12} 
        color="currentColor" 
        glow={isRestricted ? "magenta" : "cyan"} 
      />
      <span style={{ marginLeft: '4px' }}>{displayText.toUpperCase()}</span>
    </div>
  );
};