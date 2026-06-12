// Map utility functions using free OpenStreetMap services.
// - Nominatim for address search & reverse geocoding
// - OSRM (public demo) for driving distance

const NOMINATIM = "https://nominatim.openstreetmap.org";
const OSRM = "https://router.project-osrm.org";

export async function searchAddress(query) {
  if (!query || query.trim().length < 3) return [];
  const url = `${NOMINATIM}/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1&countrycodes=id`;
  try {
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) return [];
    const data = await r.json();
    return data.map((d) => ({
      label: d.display_name,
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lon),
    }));
  } catch {
    return [];
  }
}

export async function reverseGeocode(lat, lng) {
  const url = `${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
  try {
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) return "";
    const data = await r.json();
    return data?.display_name || "";
  } catch {
    return "";
  }
}

export async function routeDistanceKm(a, b) {
  // a, b = {lat, lng}
  if (!a || !b) return null;
  const url = `${OSRM}/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=false`;
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const data = await r.json();
    const meters = data?.routes?.[0]?.distance;
    if (typeof meters !== "number") return null;
    return Math.round((meters / 1000) * 10) / 10; // 1 decimal
  } catch {
    return null;
  }
}

// Surabaya default center
export const DEFAULT_CENTER = { lat: -7.2575, lng: 112.7521 };
