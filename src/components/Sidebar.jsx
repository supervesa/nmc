import React from 'react';
import { useLightSentinel } from '../context/LightSentinelContext';
import { NeonIcon, NeonCard } from './common';

export default function Sidebar() {
  const { profile, userCircle, session } = useLightSentinel();

  // Haetaan sähköpostiosoite istunnosta
  const userEmail = session?.user?.email;

  const handleLogout = async () => {
    // Tähän voi lisätä supabase.auth.signOut() myöhemmin
    console.log("Kirjaudutaan ulos...");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <NeonIcon name="shield" color="var(--turquoise)" glow="cyan" size={24} />
          <h2 style={{ fontSize: '1.2rem', letterSpacing: '2px' }}>NMC VAULT</h2>
        </div>
        <div className="text-muted sidebar-subtitle">SENTINEL LAYER 1 ACTIVE</div>
      </div>

      <nav style={{ marginTop: '40px', flex: 1 }}>
        <a href="#" className="nav-item active">
          <NeonIcon name="album" size={20} />
          <span>Galleriat</span>
        </a>
        <a href="#" className="nav-item">
          <NeonIcon name="user" size={20} />
          <span>Ystävät</span>
        </a>
        {profile?.role === 'superadmin' && (
          <a href="#" className="nav-item" style={{ color: 'var(--magenta)' }}>
            <NeonIcon name="lock" size={20} color="var(--magenta)" glow="magenta" />
            <span>Admin Control</span>
          </a>
        )}
        <a href="#" className="nav-item">
          <NeonIcon name="settings" size={20} />
          <span>Asetukset</span>
        </a>
      </nav>

      <div className="sidebar-bottom">
        <NeonCard className="user-profile" style={{ padding: '12px' }}>
          <img 
            src={profile?.avatar_url || 'https://via.placeholder.com/150'} 
            alt="Avatar" 
            className="user-avatar" 
          />
          <div className="user-info" style={{ overflow: 'hidden' }}>
            <div className="user-name">{profile?.full_name || 'Vieras'}</div>
            
            {/* UUSI: Käyttäjän sähköpostiosoite */}
            <div 
              className="text-muted" 
              style={{ 
                fontSize: '0.7rem', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                marginBottom: '2px' 
              }}
            >
              {userEmail}
            </div>

            <div className="user-role" style={{ fontSize: '0.65rem' }}>
              {userCircle?.toUpperCase() || 'JULKINEN'}
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <NeonIcon name="logout" size={18} color="var(--muted)" />
          </button>
        </NeonCard>
      </div>
    </aside>
  );
}