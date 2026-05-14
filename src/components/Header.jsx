import React from 'react'
import { Upload } from 'lucide-react'

export default function Header({ title, description, canUpload, onOpenUpload }) {
  return (
    <div className="header-bar">
      <div>
        <h1>{title}</h1>
        <div className="text-muted">{description}</div>
      </div>
      <div>
        {canUpload && (
          <button className="btn-upload" onClick={onOpenUpload}>
            <Upload size={16} className="icon-align" />
            Lataa Mediaa
          </button>
        )}
      </div>
    </div>
  )
}