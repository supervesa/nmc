import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import MediaCard from './components/MediaCard'
import AlbumView from './components/AlbumView'
import Login from './components/Login'
import UploadModal from './components/UploadModal'
import { LightSentinelProvider, useLightSentinel } from './context/LightSentinelContext'
import { supabase } from './config/supabaseClient' // UUSI: Tuodaan supabase
import './App.css'

function NmcAppContent() {
  const { session, isLoading, hasMediaAccess, userCircle, canUpload } = useLightSentinel();
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  
  // UUDET TILAT OIKEALLE DATALLE
  const [albums, setAlbums] = useState([])
  const [isFetchingAlbums, setIsFetchingAlbums] = useState(true)

  // HAE ALBUMIT JA NIIDEN KANSIKUVAT
  const fetchAlbums = async () => {
    setIsFetchingAlbums(true)
    
    // Haetaan albumit sekä niihin liittyvät kuvat (jotta saadaan kansikuva)
    const { data, error } = await supabase
      .schema('nmc')
      .from('albums')
      .select(`
        *,
        photos ( file_path )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const formattedAlbums = data.map(album => {
        // Otetaan albumin ensimmäinen kuva kansikuvaksi
        const coverPath = album.photos?.[0]?.file_path;
        
        // Supabasen funktio rakentaa kuvalle oikean nettiosoitteen
        const coverUrl = coverPath 
          ? supabase.storage.from('nmc_vault').getPublicUrl(coverPath).data.publicUrl
          : 'https://via.placeholder.com/600x400?text=Ei+kuvia';

        return {
          ...album,
          subtitle: `${new Date(album.created_at).toLocaleDateString('fi-FI')} • ${album.photos?.length || 0} kuvaa`,
          imageUrl: coverUrl
        };
      });
      setAlbums(formattedAlbums);
    } else {
      console.error("Virhe albumien haussa:", error);
    }
    
    setIsFetchingAlbums(false)
  }

  // Ladataan albumit, kun käyttäjä on todennettu
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
        <div className="glass-panel prism-edge login-form text-center">
          <h2 className="error-title">Pääsy Evätty</h2>
          <p className="text-muted">Media-moduulia ei ole aktivoitu tilillesi.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Sidebar />
      <main className="main-area">
        {!selectedAlbum ? (
          <>
            <Header 
              title="Kaikki Kuvat" 
              description={`Turvaluokitus: Näytetään vain piirin '${userCircle?.toUpperCase() || ''}' ja sitä julkisemmat kuvat`} 
              canUpload={canUpload}
              onOpenUpload={() => setIsUploadOpen(true)}
            />

            {isFetchingAlbums ? (
              <div className="loading-text text-center" style={{ marginTop: '40px' }}>Ladataan albumeita...</div>
            ) : albums.length === 0 ? (
              <div className="text-muted text-center" style={{ marginTop: '40px' }}>Ei albumeita vielä. Lataa ensimmäinen!</div>
            ) : (
              <div className="gallery-grid">
                {albums.map((album) => (
                  <MediaCard 
                    key={album.id}
                    title={album.title}
                    subtitle={album.subtitle}
                    imageUrl={album.imageUrl}
                    onClick={() => setSelectedAlbum(album)}
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
              fetchAlbums(); // PÄIVITYS: Haetaan albumit uudelleen, kun modaali suljetaan!
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