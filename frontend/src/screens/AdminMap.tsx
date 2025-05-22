import { MapContainer, TileLayer } from 'react-leaflet'
import { toast } from 'react-toastify'
import 'leaflet/dist/leaflet.css'
import '../styles/Map.css'
import { useCookies } from 'react-cookie'
import { LoginForm } from '@/components/organisms/LoginForm'
import { login } from '@/services/admin'

function AdminMap() {
  const [cookies, setCookie] = useCookies(['admin-jwt'])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement)
      .value
    console.log(email, password)
    try {
      const response = await login(email, password)
      console.log(response)
      if (response?.token) {
        setCookie('admin-jwt', response.token)
        toast.success('Login successful!')
      }
    } catch (error: unknown) {
      console.log(error)
      toast.error('Login failed. Please try again.', {
        closeOnClick: true,
        position: 'top-right',
      })
    }
  }

  return cookies['admin-jwt'] ? (
    <MapContainer center={[-32.5, -56.164]} zoom={8} scrollWheelZoom>
      <TileLayer
        url="https://geoweb.montevideo.gub.uy/geonetwork/srv/spa/catalog.search#/metadata/c6ea0476-9804-424a-9fae-2ac8ce2eee31"
        crossOrigin
      />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  ) : (
    <div className="flex justify-center items-center h-screen bg-primary">
      <LoginForm handleSubmit={handleSubmit} />
    </div>
  )
}

export default AdminMap
