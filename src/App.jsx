import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import MediaCard from './components/MediaCard'
import AlbumView from './components/AlbumView'
import Login from './components/Login'
import UploadModal from './components/UploadModal'
import { LightSentinelProvider, useLightSentinel } from './context/LightSentinelContext'
import { supabase } from './config/supabaseClient'
import { fetchLegacyAlbums } from './utils/legacyAdapter'

// TUODAAN UUDET KOMPONENTIT
import { NeonIcon, NeonButton, NeonCard } from './components/common'
import './App.css'

function NmcAppContent() {
  const { session, profile, isLoading, hasMediaAccess, userCircle, canUpload } = useLightSentinel();
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  
  const [albums, setAlbums] = useState([])
  const [isFetchingAlbums, setIsFetchingAlbums] = useState(true)

  const fetchAlbums = async () => {
    setIsFetchingAlbums(true)
    
    try {
      const { data: circlesData } = await supabase
        .from('security_circles')
        .select('value, sort_order');
        
      const circleRanks = {};
      if (circlesData) {
        circlesData.forEach(c => {
          circleRanks[c.value] = c.sort_order;
        });
      }
      
      const userRank = circleRanks[userCircle] || 0;

      const fetchNewAlbumsTask = supabase
        .schema('nmc')
        .from('albums')
        .select('*, photos ( file_path )')
        .order('created_at', { ascending: false });

      const [newAlbumsResponse, legacyAlbumsData] = await Promise.all([
        fetchNewAlbumsTask,
        fetchLegacyAlbums()
      ]);

      if (newAlbumsResponse.error) throw newAlbumsResponse.error;

      const formattedNewAlbums = (newAlbumsResponse.data || []).map(album => {
        const coverPath = album.photos?.[0]?.file_path;
        const coverUrl = coverPath 
          ? supabase.storage.from('nmc_vault').getPublicUrl(coverPath).data.publicUrl
          : 'https://via.placeholder.com/600x400?text=Ei+kuvia';

        return {
          ...album,
          subtitle: `${new Date(album.created_at).toLocaleDateString('fi-FI')} • ${album.photos?.length || 0} kuvaa`,
          imageUrl: coverUrl,
          isLegacy: false
        };
      });

      const allAlbums = [...formattedNewAlbums, ...legacyAlbumsData];

      const allowedAlbums = allAlbums.filter(album => {
        if (album.visibility === 'julkinen') return true;
        if (profile?.role === 'superadmin') return true; // JUMALMOODI
        
        const albumRank = circleRanks[album.visibility] || 999; 
        return userRank >= albumRank;
      });
      
      setAlbums(allowedAlbums);

    } catch (err) {
      console.error("Virhe albumien käsittelyssä:", err);
    } finally {
      setIsFetchingAlbums(false)
    }
  }

  useEffect(() => {
    if (session && hasMediaAccess) {
      fetchAlbums()
    }
  }, [session, hasMediaAccess])


  if (isLoading) {
    return (
      <div className="center-screen">
        <div className="loading-text">Sentinel tarkistaa oikeuksia...</div>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  if (!hasMediaAccess) {
    return (
      <div className="center-screen">
        <NeonCard className="login-form text-center" hudCorners={true}>
          <h2 style={{ color: 'var(--magenta)', marginBottom: '16px' }}>Pääsy Evätty</h2>
          <p className="text-muted">Media-moduulia ei ole aktivoitu tilillesi.</p>
        </NeonCard>
      </div>
    )
  }

  return (
    <>
      <Sidebar />
      <main className="main-area">
        {!selectedAlbum ? (
          <>
            <div className="header-bar">
              <div>
                <h1>KAIKKI KUVAT</h1>
                <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <NeonIcon name="shield" size={14} color="var(--turquoise)" />
                  PIIRI: {userCircle?.toUpperCase() || ''}
                </div>
              </div>
              
              {canUpload && (
                <NeonButton icon="plus" onClick={() => setIsUploadOpen(true)}>
                  Uusi Albumi
                </NeonButton>
              )}
            </div>

            {isFetchingAlbums ? (
              <div className="center-screen" style={{ height: 'auto', marginTop: '100px' }}>
                <div className="loading-text">Puretaan salausta...</div>
              </div>
            ) : albums.length === 0 ? (
              <div className="text-muted text-center" style={{ marginTop: '80px' }}>
                <NeonIcon name="alert" size={48} color="var(--muted)" style={{ marginBottom: '16px', opacity: 0.2 }} />
                <div>Ei löytyneitä arkistoja.</div>
              </div>
            ) : (
              <div className="gallery-grid">
                {albums.map((album) => (
                  <MediaCard 
                    key={album.id}
                    title={album.title}
                    subtitle={album.subtitle}
                    imageUrl={album.imageUrl}
                    onClick={() => setSelectedAlbum(album)}
                    isLegacy={album.isLegacy}
                    visibility={album.visibility}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <AlbumView album={selectedAlbum} onBack={() => setSelectedAlbum(null)} />
        )}

        {isUploadOpen && (
          <UploadModal 
            onClose={() => { 
              setIsUploadOpen(false); 
              fetchAlbums(); 
            }} 
          />
        )}
      </main>
    </>
  )
}

export default function App() {
  return (
    <LightSentinelProvider>
      <NmcAppContent />
    </LightSentinelProvider>
  )
}