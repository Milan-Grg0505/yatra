import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { type ReactNode } from 'react';

// Fix the missing default marker icons in production bundles
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  popup?: ReactNode;
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  height?: string;
  className?: string;
}

export function MapView({
  center = [27.7172, 85.324],
  zoom = 13,
  markers = [],
  height = '420px',
  className,
}: MapViewProps) {
  return (
    <div
      className={`rounded-2xl overflow-hidden border border-border dark:border-dark-border ${className ?? ''}`}
      style={{ height }}
    >
      <MapContainer center={center} zoom={zoom} scrollWheelZoom>
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]}>
            {m.popup && <Popup>{m.popup}</Popup>}
            {!m.popup && m.label && <Popup>{m.label}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
