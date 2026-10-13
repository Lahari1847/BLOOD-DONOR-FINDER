import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, AlertCircle, WifiOff } from 'lucide-react';
import { useLowBandwidth } from '../context/LowBandwidthContext';

interface MapMarker {
  id: string;
  name: string;
  bloodGroup: string;
  lat: number;
  lng: number;
  city: string;
  score?: number;
}

interface LeafletMapProps {
  markers: MapMarker[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  onLocationSelected?: (lat: number, lng: number) => void;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  markers,
  centerLat = 12.9716, // Default: Bengaluru
  centerLng = 77.5946,
  zoom = 12,
  onLocationSelected,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const { isLowBandwidth } = useLowBandwidth();

  const [currentLat, setCurrentLat] = useState<number>(centerLat);
  const [currentLng, setCurrentLng] = useState<number>(centerLng);
  const [geoStatus, setGeoStatus] = useState<string>('');
  const [manualLat, setManualLat] = useState<string>('');
  const [manualLng, setManualLng] = useState<string>('');

  // Handle Geolocation Request
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not supported by your browser.');
      return;
    }

    setGeoStatus('Requesting location permission...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCurrentLat(lat);
        setCurrentLng(lng);
        setGeoStatus('Location accurately acquired.');
        if (onLocationSelected) onLocationSelected(lat, lng);
        if (leafletMapRef.current) {
          leafletMapRef.current.setView([lat, lng], 13);
        }
      },
      (err) => {
        setGeoStatus('Permission denied or location unavailable. Please enter coordinates manually.');
      },
      { timeout: 8000 }
    );
  };

  const handleManualCoordinateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setCurrentLat(lat);
      setCurrentLng(lng);
      if (onLocationSelected) onLocationSelected(lat, lng);
      if (leafletMapRef.current) {
        leafletMapRef.current.setView([lat, lng], 13);
      }
      setGeoStatus(`Map centered at coordinates ${lat}, ${lng}`);
    }
  };

  useEffect(() => {
    // If low bandwidth mode is on, avoid loading heavy Leaflet tile engine
    if (isLowBandwidth) return;
    if (!mapContainerRef.current) return;

    // Load Leaflet dynamically from window if available or initialize
    const L = (window as any).L;
    if (!L) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current).setView([currentLat, currentLng], zoom);

      // OpenStreetMap free tile server
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      leafletMapRef.current = map;
    } else {
      leafletMapRef.current.setView([currentLat, currentLng], zoom);
    }

    // Clear existing markers
    if (leafletMapRef.current) {
      leafletMapRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.Circle) {
          leafletMapRef.current.removeLayer(layer);
        }
      });

      // User location circle
      L.circle([currentLat, currentLng], {
        color: '#be123c',
        fillColor: '#fda4af',
        fillOpacity: 0.25,
        radius: 5000,
      }).addTo(leafletMapRef.current);

      // Add Donor / Request Markers
      markers.forEach((m) => {
        if (Number.isFinite(m.lat) && Number.isFinite(m.lng)) {
          const marker = L.marker([m.lat, m.lng]).addTo(leafletMapRef.current);
          marker.bindPopup(`
            <div style="font-family: sans-serif; padding: 4px;">
              <strong style="color: #be123c; font-size: 14px;">${escapeHtml(m.name)}</strong><br/>
              <span style="display: inline-block; background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-top: 4px;">
                ${escapeHtml(m.bloodGroup)}
              </span>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">
                ${escapeHtml(m.city)} • Match Score: ${Number.isFinite(m.score) ? m.score : 0}/100
              </p>
            </div>
          `);
        }
      });
    }

    return () => {
      // Map cleanup on unmount
    };
  }, [markers, currentLat, currentLng, zoom, isLowBandwidth]);

  if (isLowBandwidth) {
    return (
      <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
        <div className="flex items-center gap-2 font-bold mb-2">
          <WifiOff className="w-5 h-5 text-amber-700" />
          <span>Low-Bandwidth Mode Active</span>
        </div>
        <p className="text-sm">
          Interactive map tiles are disabled to preserve data bandwidth. You can view all nearby donors
          in the List View below.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {markers.map((m) => (
            <span key={m.id} className="px-3 py-1 bg-white rounded-lg border border-amber-200 text-xs font-semibold">
              {m.name} ({m.bloodGroup}) – {m.city}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Location Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={requestUserLocation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-crimson-50 text-crimson-700 hover:bg-crimson-100 font-semibold rounded-lg text-xs transition"
          >
            <Navigation className="w-3.5 h-3.5" />
            Use My Live Location
          </button>
          {geoStatus && <span className="text-xs text-slate-500">{geoStatus}</span>}
        </div>

        {/* Manual Coordinates Input */}
        <form onSubmit={handleManualCoordinateSubmit} className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Or enter coords:</span>
          <input
            type="text"
            placeholder="Lat (12.97)"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            className="w-20 px-2 py-1 rounded border border-slate-200 text-xs focus:ring-1 focus:ring-crimson-500"
          />
          <input
            type="text"
            placeholder="Lng (77.59)"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            className="w-20 px-2 py-1 rounded border border-slate-200 text-xs focus:ring-1 focus:ring-crimson-500"
          />
          <button
            type="submit"
            className="px-2.5 py-1 bg-slate-800 text-white rounded font-medium hover:bg-slate-700"
          >
            Set
          </button>
        </form>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-96 rounded-2xl border border-slate-200 shadow-sm z-0 relative overflow-hidden"
        style={{ minHeight: '380px' }}
      />
      <p className="text-[11px] text-slate-400 text-center">
        OpenStreetMap data © OpenStreetMap contributors. Donor locations are rounded to an approximate grid to protect privacy.
      </p>
    </div>
  );
};
