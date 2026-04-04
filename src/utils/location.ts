export const isUserInIndonesia = (): boolean => {
  try {
    // 1. Check timezone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const indonesianTimeZones = [
      'Asia/Jakarta',
      'Asia/Pontianak',
      'Asia/Makassar',
      'Asia/Jayapura'
    ];
    
    if (indonesianTimeZones.includes(timeZone)) {
      return true;
    }

    // 2. Check locale (fallback)
    const locale = navigator.language || (navigator as any).userLanguage;
    if (locale && (locale.includes('ID') || locale.includes('id'))) {
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
};
