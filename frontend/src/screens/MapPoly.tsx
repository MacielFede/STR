import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import L from 'leaflet'
import type { LatLng, LeafletMouseEvent } from 'leaflet'
import '../styles/Map.css'

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

function ClickHandler({ onClick }: { onClick: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onClick(e.latlng)
    },
  })
  return null
}

function MapPoly() {
  const [markers, setMarkers] = useState<LatLng[]>([])
  const [polyPoints, setPolyPoints] = useState<LatLng[]>([])

  const handleMapClick = (latlng: LatLng) => {
    setMarkers((prev) => [...prev, latlng])
    setPolyPoints((prev) => [...prev, latlng]) // Añadir punto también a la línea/pólígono
  }

  const handleRightClick = (indexToRemove: number) => {
    setMarkers((prev) => prev.filter((_, i) => i !== indexToRemove))
    setPolyPoints((prev) => prev.filter((_, i) => i !== indexToRemove)) // Eliminar también del polígono/línea
  }

  return (
    <MapContainer center={[-32.5, -56.164]} zoom={8} scrollWheelZoom style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onClick={handleMapClick} />

      {/* Dibujar línea o polígono si hay al menos 2 puntos */}
      {polyPoints.length >= 2 && (
        <Polyline positions={polyPoints.map((p) => [p.lat, p.lng])} pathOptions={{ color: 'blue' }} />
      )}

      {/* Dibujar polígono cerrado si hay al menos 3 puntos */}
      {polyPoints.length >= 3 && (
        <Polygon positions={polyPoints.map((p) => [p.lat, p.lng])} pathOptions={{ color: 'green', fillOpacity: 0.4 }} />
      )}

      {/* Mostrar los marcadores */}
      {markers.map((position, idx) => (
        <Marker
          key={idx}
          position={position}
          icon={markerIcon}
          eventHandlers={{
            contextmenu: () => handleRightClick(idx),
          }}
        >
          <Popup>
            Marcador {idx + 1}<br />
            Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}<br />
            <em>(Clic derecho para eliminar)</em>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default MapPoly



//   Y si quiero un polígono cerrado?
// Muy fácil: reemplazá <Polyline ... /> por <Polygon ... /> y vas a tener un área cerrada:

// import { Polygon } from 'react-leaflet'

// // ...

// {points.length >= 3 && (
//   <Polygon positions={points.map(p => [p.lat, p.lng])} pathOptions={{ color: 'green', fillOpacity: 0.4 }} />
// )}