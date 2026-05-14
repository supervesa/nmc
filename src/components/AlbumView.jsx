import React, { useState, useEffect } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { supabase } from '../config/supabaseClient' // UUSI: Tuodaan supabase

export default function AlbumView({ album, onBack }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  
  // UUDET TILAT KUVILLE
  const [photos, setPhotos] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .schema('nmc')
        .from('photos')
        .select('*')
        .eq('album_id', album.id)
        .order('created_at', { ascending: true }) // Vanhimmat ensin

      if (!error && data) {
        // Luodaan jokaiselle kuvalle oikea URL-osoite
        const photosWithUrls = data.map(photo => ({
          ...photo,
          url: supabase.storage.from('nmc_vault').getPublicUrl(photo.file_path).data.publicUrl
        }))
        setPhotos(photosWithUrls)
      } else {
        console.error("Virhe kuvien haussa:", error)
      }
      
      setIsLoading(false)
    }

    if (album?.id) {
      fetchPhotos()
    }
  }, [album.id])

  return (
    <div className="album-view">
      
      <div className="header-bar">
        <div>
          <button onClick={onBack} className="btn-back">
            <ArrowLeft size={16} /> Paluu galleriaan
          </button>
          <h1>{album.title}</h1>
          <div className="text-muted">{album.subtitle}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-text text-center" style={{ marginTop: '40px' }}>Ladataan kuvia...</div>
      ) : photos.length === 0 ? (
        <div className="text-muted text-center" style={{ marginTop: '40px' }}>Albumi on tyhjä.</div>
      ) : (
        <div className="gallery-grid album-grid">
          {photos.map(photo => (
            <div 
              key={photo.id} 
              className="glass-panel prism-edge media-card album-photo-card" 
              onClick={() => setSelectedPhoto(photo)}
            >
              <div 
                className="media-thumbnail" 
                /* Inline-tyyli on tässä tapauksessa täysin oikeaoppinen, koska se syöttää dynaamisen datan (URL) Reactista */
                style={{ backgroundImage: `url(${photo.url})`, borderRadius: 'var(--radius-md)' }}
              ></div>
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <div className="lightbox-overlay" onClick={() => setSelectedPhoto(null)}>
          
          <button 
            className="lightbox-close"
            onClick={(e) => {
              e.stopPropagation(); 
              setSelectedPhoto(null);
            }}
          >
            <X size={24} />
          </button>
          
          <img 
            src={selectedPhoto.url} 
            alt="Suurennettu" 
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
          
        </div>
      )}
    </div>
  )
}