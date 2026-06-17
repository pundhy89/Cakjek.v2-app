import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, Search, X } from 'lucide-react';
import { reverseGeocode, searchAddress, GMAPS_EMBED_KEY } from '@/lib/api';
import type { Coords } from '@/types/index';

interface GoogleMapsPickerProps {
  label: string;
  value?: Coords & { address?: string };
  onChange: (val: Coords & { address: string }) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GMaps = any;

const GoogleMapsPicker: React.FC<GoogleMapsPickerProps> = ({ label, value, onChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GMaps>(null);
  const markerRef = useRef<GMaps>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ label: string; lat: number; lng: number }[]>([]);
  const [searching, setSearching] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const getG = (): GMaps => (window as GMaps).google;

  const initMap = useCallback(() => {
    if (!mapRef.current || !getG()) return;
    const g = getG();
    const center = value?.lat ? { lat: value.lat, lng: value.lng } : { lat: -7.2575, lng: 112.7521 };
    const map = new g.maps.Map(mapRef.current, {
      center, zoom: 14,
      disableDefaultUI: true, zoomControl: true, clickableIcons: false,
      mapId: 'cakjek_map',
    });
    mapInstanceRef.current = map;

    const placeMarker = (pos: GMaps) => {
      if (markerRef.current) {
        if ('position' in markerRef.current) markerRef.current.position = pos;
        else markerRef.current.setPosition(pos);
      } else {
        try {
          markerRef.current = new g.maps.marker.AdvancedMarkerElement({ map, position: pos });
        } catch {
          markerRef.current = new g.maps.Marker({ map, position: pos });
        }
      }
    };

    if (value?.lat) placeMarker(new g.maps.LatLng(value.lat, value.lng));

    map.addListener('click', async (e: GMaps) => {
      if (!e.latLng) return;
      placeMarker(e.latLng);
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const address = await reverseGeocode(lat, lng);
      setQuery(address);
      onChange({ lat, lng, address });
    });

    setMapReady(true);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (getG()?.maps) { initMap(); return; }
    const scriptId = 'gmaps-script';
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_EMBED_KEY}&libraries=marker&v=weekly&loading=async`;
      s.async = true;
      s.onload = initMap;
      document.head.appendChild(s);
    } else {
      const checkInterval = setInterval(() => {
        if (getG()?.maps) { clearInterval(checkInterval); initMap(); }
      }, 300);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    if (value?.address && !query) setQuery(value.address);
  }, [value?.address]); // eslint-disable-line

  const handleSearch = (q: string) => {
    setQuery(q);
    clearTimeout(searchTimer.current);
    if (!q || q.length < 3) { setSuggestions([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchAddress(q);
      setSuggestions(results);
      setSearching(false);
    }, 600);
  };

  const selectSuggestion = (s: { label: string; lat: number; lng: number }) => {
    setQuery(s.label);
    setSuggestions([]);
    onChange({ lat: s.lat, lng: s.lng, address: s.label });
    const g = getG();
    if (mapInstanceRef.current && g) {
      const pos = new g.maps.LatLng(s.lat, s.lng);
      mapInstanceRef.current.panTo(pos);
      mapInstanceRef.current.setZoom(15);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      const address = await reverseGeocode(lat, lng);
      setQuery(address);
      onChange({ lat, lng, address });
      const g = getG();
      if (mapInstanceRef.current && g) {
        const gpos = new g.maps.LatLng(lat, lng);
        mapInstanceRef.current.panTo(gpos);
        mapInstanceRef.current.setZoom(16);
      }
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
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
        <span className="text-xs text-muted-foreground shrink-0">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div>
          {/* Search */}
          <div className="px-3 pb-2 relative">
            <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
              <Search size={15} className="text-muted-foreground shrink-0" />
              <input
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Cari alamat..."
                className="flex-1 text-sm bg-transparent outline-none placeholder-muted-foreground"
              />
              {query && (
                <button onClick={() => { setQuery(''); setSuggestions([]); }} type="button">
                  <X size={14} className="text-muted-foreground" />
                </button>
              )}
            </div>
            {/* Suggestions */}
            {(suggestions.length > 0 || searching) && (
              <div className="absolute left-3 right-3 top-10 z-50 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
                {searching && <p className="text-xs text-muted-foreground p-3">Mencari...</p>}
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectSuggestion(s)}
                    className="w-full text-left text-sm px-4 py-2.5 hover:bg-muted border-b border-border last:border-0 transition"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Use my location */}
          <div className="px-3 pb-2">
            <button
              type="button"
              onClick={useMyLocation}
              className="flex items-center gap-2 text-xs text-primary font-semibold hover:underline"
            >
              <Navigation size={13} /> Gunakan Lokasi Saya
            </button>
          </div>

          {/* Map */}
          <div ref={mapRef} className="w-full h-48 bg-muted" />
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted text-xs text-muted-foreground">
              Memuat peta...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleMapsPicker;
