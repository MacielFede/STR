import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '../styles/Map.css'

const Map = () => {
  const [position, setPosition] = useState<[number, number] | null>(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setPosition([latitude, longitude])
      },
      (err) => {
        console.error('Error obteniendo ubicación:', err)
        // Fallback a una ubicación por defecto si falla
        setPosition([-34.9011, -56.1645]) // Buenos Aires, por ejemplo
      }
    )
  }, [])

  if (!position) return <p>Cargando mapa...</p>

  return (
    <MapContainer center={position} zoom={13}  className="leaflet-container">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {/* <Marker position={position}>
        <Popup>Estás aquí</Popup>
      </Marker> */}
    </MapContainer>
  )
}

export default Map
