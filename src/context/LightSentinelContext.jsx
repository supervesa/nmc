import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

const LightSentinelContext = createContext();

export function LightSentinelProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Sentinel Layer 1 -turvasignaali
  const [securitySignal, setSecuritySignal] = useState('GREEN');

  useEffect(() => {
    // 1. Haetaan nykyinen istunto kun sivu ladataan
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // 2. Kuunnellaan muutoksia (esim. sisään/uloskirjautuminen)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      // 1. Hae käyttäjän perusprofiili
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error("Virhe profiilin haussa:", profileError);
      }

      // 2. Hae käyttäjän roolin mukaiset globaalit oikeudet uudesta taulusta
      const userRole = profileData?.role || 'user';
      let roleData = null;
      
      if (profileData) {
        const { data, error: roleError } = await supabase
          .from('role_permissions')
          .select('*')
          .eq('role', userRole)
          .single();

        // PGRST116 tarkoittaa "ei löytynyt", mikä on odotettua jos roolitaulua ei ole vielä täytetty
        if (roleError && roleError.code !== 'PGRST116') { 
          console.error("Virhe roolien haussa:", roleError);
        } else if (data) {
          roleData = data;
        }
      }

      // 3. Yhdistetään tiedot yhteen profiili-objektiin
      if (profileData) {
        setProfile({
          ...profileData,
          role_permissions: roleData || { can_upload: false, can_delete: false, can_manage_users: false }
        });
      }
      
      // Tässä Sentinel voi myöhemmin tarkistaa IP-osoitteet / laitteet (Layer 1)
      setSecuritySignal('GREEN'); 
      
    } catch (err) {
      console.error("Odottamaton virhe profiilin latauksessa:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sentinelin apufunktiot oikeuksien tarkistamiseen
  const hasMediaAccess = profile?.permissions?.media === true;
  const userCircle = profile?.circle || 'julkinen';
  
  // LATAUSOIKEUS: 
  // 1. Tarkistetaan onko roolilla globaali oikeus (uusi taulu)
  // 2. TAI onko käyttäjällä yksilöllinen poikkeuslupa (profiilin JSON)
  const canUpload = profile?.role_permissions?.can_upload === true || profile?.permissions?.can_upload === true;

  return (
    <LightSentinelContext.Provider value={{ 
      session, 
      profile, 
      isLoading, 
      hasMediaAccess, 
      userCircle,
      securitySignal,
      canUpload
    }}>
      {children}
    </LightSentinelContext.Provider>
  );
}

// Custom hook helpottamaan käyttöä komponenteissa
export const useLightSentinel = () => {
  const context = useContext(LightSentinelContext);
  if (context === undefined) {
    throw new Error('useLightSentinel pitää olla LightSentinelProviderin sisällä');
  }
  return context;
};