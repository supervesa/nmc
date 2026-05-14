import { legacySupabase } from '../config/legacySupabaseClient';

export const fetchLegacyAlbums = async () => {
  try {
    // 1. Haetaan kaikki valokuvat vanhasta kannasta kerralla
    const { data, error } = await legacySupabase
      .from('live_posts')
      .select('*')
      .eq('type', 'photo')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // 2. Jaotellaan data kahteen leiriin sääntöjemme mukaan
    const publicPhotos = [];
    const secretPhotos = [];

    data.forEach(post => {
      // Tarkistetaan onko kuva piilotettu, hylätty TAI originals-kansiossa
      const isSecret = 
        post.is_visible === false || 
        post.status !== 'approved' || 
        (post.image_url && post.image_url.includes('/originals/'));

      if (isSecret) {
        secretPhotos.push(post);
      } else {
        publicPhotos.push(post);
      }
    });

    const virtualAlbums = [];

    // 3. Luodaan Virtuaalialbumi A: Julkinen Arkisto
    if (publicPhotos.length > 0) {
      virtualAlbums.push({
        id: 'legacy-public-archive', // Uniikki tunniste
        title: 'Juhlakuvat (Arkisto)',
        subtitle: `Tuotu arkistosta • ${publicPhotos.length} kuvaa`,
        visibility: 'tuttu', // SENTINEL-LUKKO: Näkyy tutuista ylöspäin
        imageUrl: publicPhotos[0].image_url, // Otetaan eka kuva kansikuvaksi
        isLegacy: true,
        legacyType: 'public' // Tieto AlbumViewiä varten
      });
    }

    // 4. Luodaan Virtuaalialbumi B: Salainen Holvi
    if (secretPhotos.length > 0) {
      virtualAlbums.push({
        id: 'legacy-secret-archive', // Uniikki tunniste
        title: 'Sensuroimattomat & Alkuperäiset',
        subtitle: `Vain Superadmin • ${secretPhotos.length} kuvaa`,
        visibility: 'superadmin', // SENTINEL-LUKKO: Vain superadmin näkee
        // Koska originaalit ovat yksityisessä kansiossa, käytetään tässä varoiksi placeholderia 
        // kansikuvana, jottei selain anna 403-virhettä jo etusivulla.
        imageUrl: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&q=80&w=600', 
        isLegacy: true,
        legacyType: 'secret' // Tieto AlbumViewiä varten
      });
    }

    return virtualAlbums;

  } catch (err) {
    console.error("Virhe legacy-albumien haussa:", err);
    return []; // Palautetaan tyhjä lista virhetilanteessa, jotta sovellus ei kaadu
  }
};