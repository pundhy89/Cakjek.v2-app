import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { Coords } from '@/types/index';

// Fix default marker icons for Leaflet bundled with Vite
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LeafletMapPickerProps {
  label: string;
  value?: Coords & { address?: string };
  onChange: (val: Coords & { address: string }) => void;
}

const NOMINATIM = 'https://nominatim.openstreetmap.org';

async function nominatimSearch(q: string): Promise<{ label: string; lat: number; lng: number }[]> {
  try {
    const res = await fetch(
      `${NOMINATIM}/search?q=${encodeURIComponent(q)}&format=json&limit=6&countrycodes=id&addressdetails=1`,
      { headers: { 'Accept-Language': 'id', 'User-Agent': 'CakJekApp/1.0' } }
    );
    const data = await res.json();
    return data.map((d: { display_name: string; lat: string; lon: string }) => ({
      label: d.display_name,
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lon),
    }));
  } catch { return []; }
}

async function nominatimReverse(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'id', 'User-Agent': 'CakJekApp/1.0' } }
    );
    const data = await res.json();
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch { return `${lat.toFixed(5)}, ${lng.toFixed(5)}`; }
}

const LeafletMapPicker: React.FC<LeafletMapPickerProps> = ({ label, value, onChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [query, setQuery] = useState(value?.address ?? '');
  const [suggestions, setSuggestions] = useState<{ label: string; lat: number; lng: number }[]>([]);
  const [searching, setSearching] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Init map once expanded
  useEffect(() => {
    if (!expanded || !mapRef.current || mapInstanceRef.current) return;

    const center: L.LatLngTuple = value?.lat ? [value.lat, value.lng] : [-7.2575, 112.7521];
    const map = L.map(mapRef.current, { zoomControl: true }).setView(center, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    if (value?.lat) {
      markerRef.current = L.marker([value.lat, value.lng], { draggable: true }).addTo(map);
      markerRef.current.on('dragend', async () => {
        const pos = markerRef.current!.getLatLng();
        const address = await nominatimReverse(pos.lat, pos.lng);
        setQuery(address);
        onChange({ lat: pos.lat, lng: pos.lng, address });
      });
    }

    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current.on('dragend', async () => {
          const pos = markerRef.current!.getLatLng();
          const address = await nominatimReverse(pos.lat, pos.lng);
          setQuery(address);
          onChange({ lat: pos.lat, lng: pos.lng, address });
        });
      }
      const address = await nominatimReverse(lat, lng);
      setQuery(address);
      onChange({ lat, lng, address });
    });

    mapInstanceRef.current = map;
    // Invalidate size after expand animation
    setTimeout(() => map.invalidateSize(), 200);
  }, [expanded]); // eslint-disable-line

  // Sync value address to query
  useEffect(() => {
    if (value?.address && !query) setQuery(value.address);
  }, [value?.address]); // eslint-disable-line

  const handleSearch = (q: string) => {
    setQuery(q);
    clearTimeout(searchTimer.current);
    if (!q || q.length < 3) { setSuggestions([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      const results = await nominatimSearch(q);
      setSuggestions(results);
      setSearching(false);
    }, 500);
  };

  const selectSuggestion = (s: { label: string; lat: number; lng: number }) => {
    setQuery(s.label);
    setSuggestions([]);
    onChange({ lat: s.lat, lng: s.lng, address: s.label });
    if (mapInstanceRef.current) {
      const latlng: L.LatLngTuple = [s.lat, s.lng];
      mapInstanceRef.current.setView(latlng, 15);
      if (markerRef.current) {
        markerRef.current.setLatLng(latlng);
      } else {
        markerRef.current = L.marker(latlng, { draggable: true }).addTo(mapInstanceRef.current);
        markerRef.current.on('dragend', async () => {
          const pos = markerRef.current!.getLatLng();
          const address = await nominatimReverse(pos.lat, pos.lng);
          setQuery(address);
          onChange({ lat: pos.lat, lng: pos.lng, address });
        });
      }
    }
  };

  const useMyLocation = () => {
    // Geolocation removed — gunakan pencarian alamat atau klik langsung di peta
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition"
      >
        <MapPin size={18} className="text-primary shrink-0" />
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold truncate text-foreground">
            {value?.address || query || <span className="text-muted-foreground font-normal">Pilih lokasi...</span>}
          </p>
        </div>
        {expanded ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
      </button>

      {expanded && (
        <div>
          {/* Search input */}
          <div className="px-3 pb-2 relative">
            <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
              <Search size={15} className="text-muted-foreground shrink-0" />
              <input
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Ketik nama jalan, kelurahan, kota..."
                className="flex-1 text-sm bg-transparent outline-none placeholder-muted-foreground"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); setSuggestions([]); }}>
                  <X size={14} className="text-muted-foreground" />
                </button>
              )}
            </div>
            {/* Suggestions dropdown */}
            {(suggestions.length > 0 || searching) && (
              <div className="absolute left-3 right-3 top-11 z-50 bg-popover border border-border rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
                {searching && <p className="text-xs text-muted-foreground p-3">Mencari...</p>}
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectSuggestion(s)}
                    className="w-full text-left text-xs px-4 py-2.5 hover:bg-muted border-b border-border last:border-0 transition leading-snug"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map container */}
          <div ref={mapRef} className="w-full h-52" />
          <p className="text-[10px] text-muted-foreground px-3 py-1.5 bg-muted/40">
            Klik peta atau seret pin untuk atur lokasi. Peta © OpenStreetMap
          </p>
        </div>
      )}
    </div>
  );
};

export default LeafletMapPicker;
