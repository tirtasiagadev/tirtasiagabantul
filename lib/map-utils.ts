import L from 'leaflet';

// Fix default icon issue with Leaflet in React
export const customIcon = new L.Icon({
  iconUrl: '/icon/titikair.svg',
  iconRetinaUrl: '/icon/titikair.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// For current location marker
export const locationIcon = new L.Icon({
  iconUrl: '/icon/user.svg',
  iconRetinaUrl: '/icon/user.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// For POS marker
export const posIcon = new L.Icon({
  iconUrl: '/icon/pos.svg',
  iconRetinaUrl: '/icon/pos.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

/**
 * Calculates distance between two points in km using Haversine formula
 */
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

/**
 * Common color palette for WMK sectors
 */
export const sektorColors: Record<string, string> = {
  'Banguntapan': '#e6194b', // Crimson Red
  'Bantul': '#3cb44b',      // Green
  'Imogiri': '#2856ffff',     // Royal Blue
  'Kasihan': '#f58231',     // Orange
  'Piyungan': '#911eb4',    // Purple
  'Pundong': '#c3ff00ff',     // Cyan
  'Sedayu': '#ff00e1ff',      // Magenta
};
