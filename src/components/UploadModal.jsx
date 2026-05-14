import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, Trash2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../config/supabaseClient';
// KORJATTU TUONTI NMC-PROJEKTIIN:
import { useLightSentinel } from '../context/LightSentinelContext';

export default function UploadModal({ onClose }) {
  // KORJATTU KOUKKU:
  const { userProfile } = useLightSentinel();

  const [circleOptions, setCircleOptions] = useState([]); // Paikallinen tila dynaamisille piireille
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('julkinen');
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const fileInputRef = useRef(null);

  // UUSI: Haetaan turvapiirit Supabasesta, kun modaali aukeaa
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

    // HAETAAN KÄYTTÄJÄ SUORAAN SUPABASESTA LATAUSHETKELLÄ (Pomminvarma tapa)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      alert("Virhe: Istunto on vanhentunut. Kirjaudu sisään uudelleen.");
      return;
    }

    const userId = user.id; // Nyt meillä on 100% varmuudella oikea ID

    setIsUploading(true);
    setUploadProgress('Luodaan albumia...');

    try {
      // 1. Luodaan albumi nmc-skeemaan
      const { data: albumData, error: albumError } = await supabase
        .schema('nmc')
        .from('albums')
        .insert({
          title: title,
          visibility: visibility,
          created_by: userId // Käytetään luotettavaa ID:tä
        })
        .select()
        .single();

      if (albumError) throw albumError;

      const albumId = albumData.id;
      let uploadedCount = 0;

      // 2. Ladataan kuvat ja tallennetaan metadata
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
            created_by: userId // Käytetään luotettavaa ID:tä
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

  return (
    <div className="lightbox-overlay" onClick={!isUploading ? onClose : undefined}>
      <div className="glass-panel prism-edge upload-modal" onClick={(e) => e.stopPropagation()}>
        
        {!isUploading && (
          <button className="lightbox-close upload-close" onClick={onClose}>
            <X size={20} />
          </button>
        )}
        
        <div className="login-header">
          <h2>LATAA MEDIAA</h2>
          <div className="text-muted">Lisää uusi albumi ja määritä sen turvaluokitus</div>
        </div>

        <div className="upload-form-scroll-area">
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label className="text-muted">Albumin nimi</label>
              <input 
                type="text" 
                placeholder="Esim. Kesäretki 2026" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input"
                required
                disabled={isUploading}
              />
            </div>

            <div className="form-group">
              <label className="text-muted">Näkyvyystaso (Turvaluokitus)</label>
              <select 
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="glass-input glass-select"
                disabled={isUploading}
              >
                <option value="julkinen">Julkinen (Kaikki näkevät)</option>
                {/* Dynaaminen lista kääntyy nyt suoraan paikallisesta tilasta */}
                {circleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} (Rajoitettu piiri)
                  </option>
                ))}
              </select>
            </div>

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
              <UploadCloud size={48} className="upload-icon" />
              <p>Raahaa kuvat tähän tai <strong className="text-highlight">selaa tiedostoja</strong></p>
            </div>

            {files.length > 0 && (
              <div className="file-preview-container">
                <div className="file-preview-header">Valitut kuvat ({files.length}):</div>
                {files.map((file, index) => (
                  <div key={index} className="file-preview-item">
                    <div className="file-preview-info">
                      <ImageIcon size={16} className="text-muted" />
                      <span className="file-name">{file.name}</span>
                    </div>
                    {!isUploading && (
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeFile(index); }} 
                        className="btn-remove-file"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-upload form-button action-mt" 
              disabled={isUploading || files.length === 0}
            >
              {isUploading ? uploadProgress : 'Luo albumi ja lataa'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}