import React from 'react'

export default function MediaCard({ title, subtitle, imageUrl, onClick }) {
  return (
    <div className="glass-panel prism-edge media-card" onClick={onClick}>
      <div 
        className="media-thumbnail" 
        style={{ backgroundImage: `url('${imageUrl}')` }}
      ></div>
      <div className="media-info">
        <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{title}</h3>
        <div className="text-muted">{subtitle}</div>
      </div>
    </div>
  )
}