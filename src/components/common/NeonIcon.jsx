import React from 'react';
import { 
  Camera, 
  User, 
  ArrowLeft, 
  X, 
  MessageSquare, 
  Image as ImageIcon, 
  Upload, 
  Shield, 
  Lock, 
  Unlock,
  Settings, 
  LogOut, 
  AlertCircle,
  Plus,
  ChevronDown
} from 'lucide-react';

// 1. IKONISANAKIRJA (Lisää ikoneita tänne sitä mukaa kun tarvitset)
const iconMap = {
  camera: Camera,
  user: User,
  back: ArrowLeft,
  close: X,
  comments: MessageSquare,
  album: ImageIcon,
  image: ImageIcon,
  upload: Upload,
  plus: Plus,
  shield: Shield,
  lock: Lock,
  unlock: Unlock,
  settings: Settings,
  logout: LogOut,
  arrow_down: ChevronDown,
  alert: AlertCircle
};

export const NeonIcon = ({ 
  name, 
  size = 20, 
  color = 'currentColor', 
  glow = false, // Voi olla true, 'cyan', 'magenta' tai hex-koodi
  className = '',
  style = {},
  ...props 
}) => {
  
  // 2. HAETAAN IKONI SANAKIRJASTA
  // Muutetaan nimi pieniksi kirjaimiksi varmuuden vuoksi
  const LucideIcon = iconMap[name?.toLowerCase()];

  // 3. VIRHEENKÄSITTELY (Fallback)
  if (!LucideIcon) {
    console.warn(`NeonIcon: Ikonia nimeltä "${name}" ei löytynyt sanakirjasta.`);
    // Palautetaan punaisena hohtava varoitusikoni, jos nimeä ei löydy
    return (
      <AlertCircle 
        size={size} 
        color="#ff003c" 
        style={{ filter: 'drop-shadow(0 0 8px #ff003c)' }} 
        {...props} 
      />
    );
  }

  // 4. NEON-HEHKUN LASKENTA
  let filterStyle = 'none';
  if (glow) {
    // Määritellään hehkun väri
    let glowColor = 'var(--turquoise)'; // Oletus: Kyber-turkoosi
    
    if (glow === 'magenta') glowColor = 'var(--magenta)';
    else if (glow === 'gold') glowColor = 'var(--plasma-gold)';
    else if (typeof glow === 'string' && glow !== 'true') glowColor = glow; // Custom väri
    
    filterStyle = `drop-shadow(0 0 8px ${glowColor})`;
  }

  // 5. RENDERÖINTI
  return (
    <LucideIcon 
      size={size} 
      color={color} 
      className={`neon-icon ${className}`}
      style={{ 
        filter: filterStyle, 
        transition: 'all 0.3s ease',
        ...style 
      }} 
      {...props} 
    />
  );
};