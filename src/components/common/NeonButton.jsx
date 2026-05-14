import React from 'react';
import { NeonIcon } from './NeonIcon';

export const NeonButton = ({ 
  children, 
  variant = 'primary', // 'primary', 'outline', 'ghost'
  size = 'normal',     // 'normal', 'small'
  icon = null,         // Ikonin nimi sanakirjasta, esim. 'upload'
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  className = '',
  onClick,
  disabled,
  ...props 
}) => {
  
  // Rakennetaan dynaamiset CSS-luokat
  const baseClass = 'jc-btn';
  const variantClass = variant === 'primary' ? 'primary' : variant === 'outline' ? 'outline' : 'btn-return'; // btn-return toimii ghost-nappina
  const sizeClass = size === 'small' ? 'small' : '';
  const widthClass = fullWidth ? 'w-100' : '';
  
  const finalClassName = `${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim();

  return (
    <button 
      className={finalClassName} 
      onClick={onClick}
      disabled={disabled || isLoading}
      style={{ width: fullWidth ? '100%' : 'auto', gap: '8px' }}
      {...props}
    >
      {/* Lataussnurra TAI Vasen ikoni */}
      {isLoading ? (
        <span className="jc-spinner" style={{ height: 'auto', width: '18px', display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
      ) : (
        icon && iconPosition === 'left' && <NeonIcon name={icon} size={size === 'small' ? 14 : 18} />
      )}
      
      {/* Napin teksti */}
      <span>{children}</span>
      
      {/* Oikea ikoni (näkyy vain jos ei ladata ja iconPosition on right) */}
      {!isLoading && icon && iconPosition === 'right' && (
        <NeonIcon name={icon} size={size === 'small' ? 14 : 18} />
      )}
    </button>
  );
};