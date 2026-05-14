import React from 'react'
import { Image, FolderOpen, Star, ArrowLeft, LogOut } from 'lucide-react'
import { useLightSentinel } from '../context/LightSentinelContext'
import { supabase } from '../config/supabaseClient'

export default function Sidebar() {
  const { profile } = useLightSentinel()

  // Uloskirjautuminen tuhoaa session Supabasesta.
  // LightSentinelContext huomaa tämän automaattisesti, ja App.jsx 
  // palauttaa käyttäjän välittömästi takaisin Login-ruutuun.
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // Generoidaan nimikirjaimista väliaikainen avatar, jos tietokannassa ei ole kuvaa
  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || 'Käyttäjä'}`

  return (
    <aside className="glass-panel sidebar prism-edge">
      <div className="sidebar-header">
        <h2 className="sidebar-brand">NMC</h2>
        <div className="text-muted sidebar-subtitle">Nessling Media Central</div>
      </div>

      <nav>
        <a href="#" className="nav-item active">
          <Image size={18} className="icon-align" />
          <span>Kaikki Kuvat</span>
        </a>
        <a href="#" className="nav-item">
          <FolderOpen size={18} className="icon-align" />
          <span>Albumit</span>
        </a>
        <a href="#" className="nav-item">
          <Star size={18} className="icon-align" />
          <span>Suosikit</span>
        </a>
      </nav>

      <div className="sidebar-bottom">
        <div className="user-profile">
          <img 
            src={avatarUrl} 
            alt="Profiilikuva" 
            className="user-avatar" 
          />
          <div className="user-info">
            <span className="user-name">{profile?.full_name || 'Ladataan...'}</span>
            <span className="user-role">{profile?.role || 'Käyttäjä'}</span>
          </div>
        </div>

        <button className="btn-return" onClick={() => window.location.href = 'http://localhost:3000/dashboard'}>
          <ArrowLeft size={16} className="icon-align" />
          NSG Keskushallinto
        </button>

        <button className="btn-return" onClick={handleLogout}>
          <LogOut size={16} className="icon-align" />
          Vaihda käyttäjää
        </button>
      </div>

    </aside>
  )
}