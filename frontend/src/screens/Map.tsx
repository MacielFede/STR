import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import L from 'leaflet'
import type { LatLng, LeafletMouseEvent } from 'leaflet'
import '../styles/Map.css'

// Ícono personalizado para evitar errores con el default
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

type ClickHandlerProps = {
  onClick: (latlng: LatLng) => void
}

function ClickHandler({ onClick }: ClickHandlerProps) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onClick(e.latlng)
    },
  })
  return null
}

function Map() {
  const [markers, setMarkers] = useState<LatLng[]>([])

  const handleMapClick = (latlng: LatLng) => {
    setMarkers((prev) => [...prev, latlng])
  }

  return (
    <MapContainer center={[-32.5, -56.164]} zoom={8} scrollWheelZoom style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onClick={handleMapClick} />
      {markers.map((position, idx) => (
        <Marker key={idx} position={position} icon={markerIcon}>
          <Popup>
            Marcador {idx + 1}<br />
            Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default Map