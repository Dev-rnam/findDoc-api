
/**
 * Calcule la zone de délimitation (bounding box) autour d'un point GPS.
 * @param lat - Latitude du point central.
 * @param lng - Longitude du point central.
 * @param radiusInKm - Le rayon en kilomètres pour définir la taille de la boîte.
 * @returns Un objet avec les latitudes et longitudes min/max.
 */
export function getBoundingBox(lat: number, lng: number, radiusInKm: number) {
    const earthRadiusKm = 6371;
  
    // Conversion du rayon en radians
    const latRad = (lat * Math.PI) / 180;
  
    // Calcul des deltas de latitude et longitude
    const deltaLat = (radiusInKm / earthRadiusKm) * (180 / Math.PI);
    const deltaLng = (radiusInKm / (earthRadiusKm * Math.cos(latRad))) * (180 / Math.PI);
  
    return {
      minLat: lat - deltaLat,
      maxLat: lat + deltaLat,
      minLng: lng - deltaLng,
      maxLng: lng + deltaLng,
    };
  }