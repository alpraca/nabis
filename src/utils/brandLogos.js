// Brand logo utility
const brandLogos = {
  '4U': '/src/assets/logos/4U.png',
  'A-Derma': '/src/assets/logos/A-Derma.jpg',
  'Abena': '/src/assets/logos/Abena.png',
  'Accu-Check': '/src/assets/logos/Accu-Check.pdf',
  'Alinter': '/src/assets/logos/Alinter.png',
  'Aptamil': '/src/assets/logos/Aptamil.png',
  'ATC': '/src/assets/logos/ATC.svg',
  'Avene': '/src/assets/logos/Avene.jpg',
  'Avène': '/src/assets/logos/Avène.jpg',
  'Bambo': '/src/assets/logos/Bambo.png',
  'Bio-Oil': '/src/assets/logos/Bio-Oil.jpg',
  'Bio': '/src/assets/logos/Bio.svg',
  'Bionime': '/src/assets/logos/Bionime.jpg',
  'Buona': '/src/assets/logos/Buona.png',
  'Caudalie': '/src/assets/logos/Caudalie.png',
  'Contour': '/src/assets/logos/Contour.svg',
  'Dr.': '/src/assets/logos/Dr..png',
  'Durex': '/src/assets/logos/Durex.svg',
  'Easy': '/src/assets/logos/Easy.jpg',
  'Guam': '/src/assets/logos/Guam.png',
  'Hipp': '/src/assets/logos/Hipp.svg',
  'Holle': '/src/assets/logos/Holle.pdf',
  'Huggies': '/src/assets/logos/Huggies.jpg',
  'iHealth': '/src/assets/logos/iHealth.jpg',
  'Imetec': '/src/assets/logos/Imetec.jpg',
  'Kidal': '/src/assets/logos/Kidal.svg',
  'Korff': '/src/assets/logos/Korff.svg',
  'La Roche Posay': '/src/assets/logos/La_Roche_Posay.svg',
  'Logus': '/src/assets/logos/Logus.png',
  'Medel': '/src/assets/logos/Medel.jpg',
  'Mister': '/src/assets/logos/Mister.png',
  'Mustela': '/src/assets/logos/Mustela.jpg',
  'NaturaVerde': '/src/assets/logos/NaturaVerde.png',
  'Now': '/src/assets/logos/Now.svg',
  'Nuxe': '/src/assets/logos/Nuxe.png',
  'Olimp': '/src/assets/logos/Olimp.jpg',
  'Omron': '/src/assets/logos/Omron.svg',
  'On': '/src/assets/logos/On.svg',
  'Pampers': '/src/assets/logos/Pampers.JPG',
  'Phyto': '/src/assets/logos/Phyto.jpg',
  'PIC': '/src/assets/logos/PIC.svg',
  'Pingo': '/src/assets/logos/Pingo.svg',
  'Rene': '/src/assets/logos/Rene.jpg',
  'Smart': '/src/assets/logos/Smart.jpg',
  'Splat': '/src/assets/logos/Splat.svg',
  'Syrio': '/src/assets/logos/Syrio.png',
  'Tena': '/src/assets/logos/Tena.png',
  'U.G.A.': '/src/assets/logos/U.G.A..jpg',
  'Vichy': '/src/assets/logos/Vichy.jpg',
}

/**
 * Get brand logo URL for a given brand name
 * @param {string} brandName - The brand name to look up
 * @returns {string|null} - The logo URL or null if not found
 */
export const getBrandLogo = (brandName) => {
  if (!brandName) return null
  
  // Try exact match first
  if (brandLogos[brandName]) {
    return brandLogos[brandName]
  }
  
  // Try case-insensitive match
  const lowerBrandName = brandName.toLowerCase()
  for (const [key, value] of Object.entries(brandLogos)) {
    if (key.toLowerCase() === lowerBrandName) {
      return value
    }
  }
  
  // Try partial matches for common variations
  for (const [key, value] of Object.entries(brandLogos)) {
    if (key.toLowerCase().includes(lowerBrandName) || lowerBrandName.includes(key.toLowerCase())) {
      return value
    }
  }
  
  return null
}

/**
 * Check if a brand has a logo available
 * @param {string} brandName - The brand name to check
 * @returns {boolean} - True if logo exists, false otherwise
 */
export const hasBrandLogo = (brandName) => {
  return getBrandLogo(brandName) !== null
}

/**
 * Get all available brand logos
 * @returns {Object} - Object with brand names as keys and logo URLs as values
 */
export const getAllBrandLogos = () => {
  return { ...brandLogos }
}