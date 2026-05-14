import React from 'react';
import { useLightSentinel } from '../context/LightSentinelContext';
import { NeonCard, NeonTag } from './common';

export default function MediaCard({ title, subtitle, imageUrl, onClick, visibility, isLegacy }) {
  const { profile } = useLightSentinel();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';

  return (
    <NeonCard 
      className="media-card" 
      onClick={onClick} 
      hudCorners={true}
      style={{ padding: '0', overflow: 'hidden' }}
    >
      {/* 1. TURVALUOKITUS-TAGI (Ylhäällä oikealla) */}
      {isAdmin && (
        <NeonTag type={visibility} />
      )}

      <div 
        className="media-thumbnail" 
        style={{ 
          backgroundImage: `url(${imageUrl})`,
          height: '200px',
          position: 'relative' // Varmistaa että tagit pysyvät sisällä
        }}
      >
        {/* 2. LEGACY-TAGI (Alhaalla vasemmalla) */}
        {isLegacy && (
          <NeonTag 
            type="public" 
            label="LEGACY ARCHIVE" 
            style={{ 
              top: 'auto', 
              right: 'auto',
              bottom: '12px', 
              left: '12px', 
              color: 'var(--plasma-gold)', 
              borderColor: 'var(--plasma-gold)',
              boxShadow: '0 0 10px rgba(212, 175, 55, 0.2)'
            }} 
          />
        )}
      </div>

      <div className="media-info">
        <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{title}</h3>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{subtitle}</div>
      </div>
    </NeonCard>
  );
}