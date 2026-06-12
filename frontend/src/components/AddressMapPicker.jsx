import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Locate, MapPin, X } from "lucide-react";
import { searchAddress, reverseGeocode, DEFAULT_CENTER } from "../lib/maps";

// Fix default marker icons (Leaflet defaults break with bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 16, { duration: 0.6 });
  }, [coords, map]);
  return null;
};

const ClickHandler = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

export default function AddressMapPicker({
  label,
  value,
  coords,
  onChange,
  placeholder = "Cari atau ketik alamat",
  testid = "address-picker",
}) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [showMap, setShowMap] = useState(!!coords);
  const debounceRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const triggerSearch = (q) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const r = await searchAddress(q);
      setResults(r);
      setOpen(r.length > 0);
    }, 450);
  };

  const handleInput = (v) => {
    setQuery(v);
    onChange(v, coords); // keep current coords, but new typed text
    triggerSearch(v);
  };

  const pick = (r) => {
    setQuery(r.label);
    setOpen(false);
    setShowMap(true);
    onChange(r.label, { lat: r.lat, lng: r.lng });
  };

  const onMarkerDragOrClick = async (c) => {
    onChange(query || "", c);
    const addr = await reverseGeocode(c.lat, c.lng);
    if (addr) {
      setQuery(addr);
      onChange(addr, c);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setShowMap(true);
      const addr = await reverseGeocode(c.lat, c.lng);
      setQuery(addr || `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`);
      onChange(addr || "", c);
    });
  };

  const center = coords || DEFAULT_CENTER;

  return (
    <div className="block" data-testid={testid}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <button
          type="button"
          onClick={useMyLocation}
          data-testid={`${testid}-mylocation`}
          className="text-[10px] inline-flex items-center gap-1 text-primary font-semibold hover:underline"
        >
          <Locate size={11} /> Lokasi saya
        </button>
      </div>

      <div className="relative mt-1">
        <input
          data-testid={`${testid}-input`}
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={placeholder}
          className="w-full bg-secondary text-foreground rounded-xl px-4 py-2.5 pr-9 text-sm border border-transparent focus:border-primary focus:bg-card outline-none transition"
        />
        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />

        {open && results.length > 0 && (
          <div className="absolute z-[60] mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-xl max-h-60 overflow-auto">
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pick(r)}
                data-testid={`${testid}-result-${i}`}
                className="w-full text-left px-3 py-2 text-xs hover:bg-secondary border-b border-border last:border-b-0"
              >
                <MapPin size={12} className="inline mr-1 text-primary" /> {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!showMap && coords && (
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="mt-2 text-xs text-primary font-semibold hover:underline"
        >
          Tampilkan peta
        </button>
      )}

      {showMap && (
        <div className="mt-2 relative rounded-2xl overflow-hidden border border-border" style={{ height: 180 }}>
          <MapContainer
            center={[center.lat, center.lng]}
            zoom={coords ? 16 : 13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap coords={coords} />
            <ClickHandler onPick={onMarkerDragOrClick} />
            {coords && (
              <Marker
                position={[coords.lat, coords.lng]}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const ll = e.target.getLatLng();
                    onMarkerDragOrClick({ lat: ll.lat, lng: ll.lng });
                  },
                }}
              />
            )}
          </MapContainer>
          <button
            type="button"
            onClick={() => setShowMap(false)}
            className="absolute top-2 right-2 z-[400] bg-white/90 dark:bg-zinc-900/90 backdrop-blur p-1.5 rounded-full shadow"
            data-testid={`${testid}-close-map`}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {coords && (
        <p className="mt-1 text-[10px] text-muted-foreground">
          📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} — tarik marker untuk geser
        </p>
      )}
    </div>
  );
}
