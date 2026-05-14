import React, { useState } from 'react'
import { supabase } from '../config/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })
    
    if (error) setErrorMsg(error.message)
    setLoading(false)
  }

  return (
    <div className="center-screen">
      <form onSubmit={handleLogin} className="glass-panel prism-edge login-form">
        
        <div className="login-header">
          <h2>NSG LOGIN</h2>
          <div className="text-muted">Keskushallinnon tunnistautuminen</div>
        </div>

        {errorMsg && <div className="error-message">{errorMsg}</div>}

        <input 
          type="email" 
          placeholder="Sähköpostiosoite" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          className="glass-input"
          required
        />
        <input 
          type="password" 
          placeholder="Salasana" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          className="glass-input"
          required
        />
        
        <button type="submit" className="btn-upload form-button" disabled={loading}>
          {loading ? 'Tunnistetaan...' : 'Kirjaudu Sisään'}
        </button>

      </form>
    </div>
  )
}