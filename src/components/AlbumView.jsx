import React, { useState, useEffect } from 'react'
import { ArrowLeft, X, MessageSquare } from 'lucide-react'
import { supabase } from '../config/supabaseClient'
import { legacySupabase } from '../config/legacySupabaseClient' 

export default function AlbumView({ album, onBack }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [photos, setPhotos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [comments, setComments] = useState([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)

  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true)
      
      // HAETAAN ARKISTON (LEGACY) KUVAT
      if (album.isLegacy) {
        
        // 1. HAETAAN TIETOKANNASTA (live_posts)
        const { data: dbData, error: dbError } = await legacySupabase
          .from('live_posts')
          .select('*')
          .eq('type', 'photo')
          .order('created_at', { ascending: false });

        let formattedDbPhotos = [];

        if (!dbError && dbData) {
          const filteredData = dbData.filter(post => {
            const isSecret = post.is_visible === false || post.status !== 'approved' || (post.image_url && post.image_url.includes('/originals/'));
            return album.legacyType === 'secret' ? isSecret : !isSecret;
          });

          formattedDbPhotos = await Promise.all(filteredData.map(async (post) => {
            let finalUrl = post.image_url;
            if (album.legacyType === 'secret' && post.image_url && post.image_url.includes('/originals/')) {
              try {
                const pathPart = post.image_url.split('party-photos/')[1];
                if (pathPart) {
                  const { data: signedData } = await legacySupabase
                    .storage
                    .from('party-photos')
                    .createSignedUrl(pathPart, 3600);
                    
                  if (signedData) finalUrl = signedData.signedUrl;
                }
              } catch (err) {
                console.error("Yksityisen kuvan lupahaku epäonnistui", err);
              }
            }
            return {
              id: post.id,
              url: finalUrl,
              message: post.message,
              sender_name: post.sender_name
            };
          }));
        }

        // 2. HAETAAN SUORAAN STORAGE-ÄMPÄRISTÄ (Vain salaiselle kansiolle!)
        let bucketPhotos = [];
        if (album.legacyType === 'secret') {
          try {
            // Listataan kaikki tiedostot originals-kansiosta
            const { data: fileList, error: listError } = await legacySupabase
              .storage
              .from('party-photos')
              .list('originals', { limit: 500, sortBy: { column: 'created_at', order: 'desc' } });

            if (!listError && fileList) {
              // Suodatetaan pois mahdolliset tyhjät kansiomerkinnät
              const validFiles = fileList.filter(f => f.name && f.name !== '.emptyFolderPlaceholder');
              
              // Rakennetaan polut (esim. 'originals/kuva.jpg')
              const paths = validFiles.map(f => `originals/${f.name}`);

              if (paths.length > 0) {
                // Haetaan kaikille kerralla allekirjoitetut URLit (erittäin nopea!)
                const { data: signedUrlsData, error: signedError } = await legacySupabase
                  .storage
                  .from('party-photos')
                  .createSignedUrls(paths, 3600);

                if (!signedError && signedUrlsData) {
                  bucketPhotos = signedUrlsData.map((item, index) => ({
                    id: `bucket-orig-${validFiles[index].id || index}`,
                    url: item.signedUrl,
                    message: 'Alkuperäinen raakakuva (Storage)',
                    sender_name: 'Järjestelmä'
                  }));
                }
              }
            }
          } catch (err) {
            console.error("Virhe bucket-kuvien haussa:", err);
          }
        }

        // 3. YHDISTETÄÄN MOLEMMAT LISTAT JA NÄYTETÄÄN RUUDULLA
        setPhotos([...formattedDbPhotos, ...bucketPhotos]);
      } 
      
      // HAETAAN NORMAALIT UUDEN KANNAN KUVAT (NMC)
      else {
        const { data, error } = await supabase
          .schema('nmc')
          .from('photos')
          .select('*')
          .eq('album_id', album.id)
          .order('created_at', { ascending: true })

        if (!error && data) {
          const photosWithUrls = data.map(photo => ({
            ...photo,
            url: supabase.storage.from('nmc_vault').getPublicUrl(photo.file_path).data.publicUrl
          }))
          setPhotos(photosWithUrls)
        } else {
          console.error("Virhe kuvien haussa:", error)
        }
      }
      
      setIsLoading(false)
    }

    if (album?.id) {
      fetchPhotos()
    }
  }, [album])

  useEffect(() => {
    const fetchComments = async () => {
      // Haetaan kommentit vain jos kuva on tietokannasta (eikä suoraan Storagesta tuotu raakakuva)
      if (selectedPhoto && album.isLegacy && !selectedPhoto.id.toString().startsWith('bucket-orig')) {
        setIsLoadingComments(true);
        const { data, error } = await legacySupabase
          .from('comments')
          .select('*')
          .eq('post_id', selectedPhoto.id)
          .order('created_at', { ascending: true });

        if (!error && data) {
          setComments(data);
        }
        setIsLoadingComments(false);
      } else {
        setComments([]);
      }
    };

    fetchComments();
  }, [selectedPhoto, album.isLegacy]);

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
                style={{ backgroundImage: `url(${photo.url})`, borderRadius: 'var(--radius-md)' }}
              ></div>
              {photo.message && (
                <div style={{ padding: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <strong>{photo.sender_name}:</strong> {photo.message}
                </div>
              )}
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
          
          <div className="lightbox-content-wrapper" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedPhoto.url} 
              alt="Suurennettu" 
              className="lightbox-image"
            />
            
            {/* Arkiston kommenttiosio näytetään vain tietokantakuville, ei pelkille storage-raakakuville */}
            {album.isLegacy && !selectedPhoto.id.toString().startsWith('bucket-orig') && (
              <div className="glass-panel prism-edge lightbox-comments-sidebar">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <MessageSquare size={18} /> Seinä ja Kommentit
                </h3>
                
                {selectedPhoto.message && (
                  <div className="original-message" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div style={{ color: 'var(--highlight-blue)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>Alkuperäinen viesti</div>
                    <strong>{selectedPhoto.sender_name}:</strong> {selectedPhoto.message}
                  </div>
                )}

                {isLoadingComments ? (
                  <div className="text-muted">Ladataan kommentteja...</div>
                ) : comments.length > 0 ? (
                  <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {comments.map(comment => (
                      <div key={comment.id} className="comment-item">
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{comment.author_name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{comment.content}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted" style={{ fontSize: '0.9rem' }}>Ei kommentteja.</div>
                )}
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  )
}