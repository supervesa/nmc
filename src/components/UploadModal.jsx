import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { useLightSentinel } from '../context/LightSentinelContext';

// 1. TUODAAN UUDET KYBERPUNK-KOMPONENTIT OHJAUSKESKUKSESTA
import { NeonIcon, NeonButton, NeonInput, NeonCard, NeonSelect } from './common';

export default function UploadModal({ onClose }) {
  const { userProfile } = useLightSentinel();

  const [circleOptions, setCircleOptions] = useState([]); 
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('julkinen');
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCircles = async () => {
      const { data, error } = await supabase
        .from('security_circles')
        .select('*')
        .order('sort_order');
      
      if (!error && data) {
        setCircleOptions(data);
      }
    };
    fetchCircles();
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Valitse vähintään yksi kuva ladattavaksi.");
      return;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      alert("Virhe: Istunto on vanhentunut. Kirjaudu sisään uudelleen.");
      return;
    }

    const userId = user.id; 

    setIsUploading(true);
    setUploadProgress('Luodaan albumia...');

    try {
      const { data: albumData, error: albumError } = await supabase
        .schema('nmc')
        .from('albums')
        .insert({
          title: title,
          visibility: visibility,
          created_by: userId 
        })
        .select()
        .single();

      if (albumError) throw albumError;

      const albumId = albumData.id;
      let uploadedCount = 0;

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${visibility}/${fileName}`;

        setUploadProgress(`Ladataan kuvaa ${uploadedCount + 1} / ${files.length}...`);

        const { error: uploadError } = await supabase.storage
          .from('nmc_vault')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: photoError } = await supabase
          .schema('nmc')
          .from('photos')
          .insert({
            album_id: albumId,
            file_path: filePath,
            created_by: userId 
          });

        if (photoError) throw photoError;
        
        uploadedCount++;
      }

      setUploadProgress('Valmis!');
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error("Latausvirhe:", error);
      alert("Virhe tallennuksessa: " + error.message);
      setIsUploading(false);
    }
  };

  // 2. MUOTOILLAAN OPTIOT NeonSelectiä varten
  const selectOptions = [
    { value: 'julkinen', label: 'Julkinen (Kaikki näkevät)' },
    ...circleOptions.map(opt => ({
      value: opt.value,
      label: `${opt.label || opt.value} (Rajoitettu piiri)`
    }))
  ];

  return (
    <div className="lightbox-overlay" onClick={!isUploading ? onClose : undefined}>
      {/* 3. KORVATTU TAVALLINEN DIV NEON-KORTILLA */}
      <NeonCard className="upload-modal" onClick={(e) => e.stopPropagation()} hudCorners={true}>
        
        {!isUploading && (
          <button className="lightbox-close upload-close" onClick={onClose} style={{ zIndex: 10 }}>
            <NeonIcon name="close" size={24} glow="magenta" color="var(--magenta)" />
          </button>
        )}
        
        <div className="login-header">
          <h2>LATAA MEDIAA</h2>
          <div className="text-muted">Lisää uusi albumi ja määritä sen turvaluokitus</div>
        </div>

        <div className="upload-form-scroll-area">
          <form onSubmit={handleUpload} className="upload-form">
            
            {/* 4. TÄYSIN PUHDAS NEON-INPUT */}
            <NeonInput 
              label="Albumin nimi"
              placeholder="Esim. Kesäretki 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isUploading}
              icon="album"
            />

            {/* 5. TÄYSIN PUHDAS NEON-SELECT */}
            <NeonSelect 
              label="Näkyvyystaso (Turvaluokitus)"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              disabled={isUploading}
              options={selectOptions}
              icon="shield"
            />

            <input 
              type="file" 
              multiple 
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden-input"
            />

            <div 
              className={`drag-drop-zone ${isUploading ? 'disabled' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current.click()}
            >
              <NeonIcon name="upload" size={48} color="var(--turquoise)" glow="cyan" style={{ marginBottom: '16px' }} />
              <p>Raahaa kuvat tähän tai <strong style={{ color: 'var(--turquoise)' }}>selaa tiedostoja</strong></p>
            </div>

            {files.length > 0 && (
              <div className="file-preview-container">
                <div className="file-preview-header">Valitut kuvat ({files.length}):</div>
                {files.map((file, index) => (
                  <div key={index} className="file-preview-item">
                    <div className="file-preview-info">
                      <NeonIcon name="image" size={16} color="var(--muted)" />
                      <span className="file-name" style={{ marginLeft: '8px' }}>{file.name}</span>
                    </div>
                    {!isUploading && (
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeFile(index); }} 
                        className="btn-remove-file"
                      >
                        <NeonIcon name="close" size={16} color="var(--magenta)" glow="magenta" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 6. ÄLYKÄS NEON-PAINIKE */}
            <NeonButton 
              type="submit" 
              className="action-mt"
              icon="upload"
              fullWidth={true}
              isLoading={isUploading}
              disabled={files.length === 0}
            >
              {isUploading ? uploadProgress : 'Luo albumi ja lataa'}
            </NeonButton>

          </form>
        </div>
      </NeonCard>
    </div>
  );
}