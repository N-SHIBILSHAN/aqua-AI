import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { detectionAPI } from '../services/api'
import { MapPin, Navigation } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MapView() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Load Leaflet dynamically
    const loadMap = async () => {
      try {
        const L = await import('leaflet')
        await import('react-leaflet')
        setMapLoaded(true)
        fetchLocations()
      } catch (err) {
        console.error('Map load error:', err)
        setLoading(false)
      }
    }
    loadMap()
  }, [])

  const fetchLocations = async () => {
    try {
      const res = await detectionAPI.getMapData()
      setLocations(res.data.locations || [])
    } catch (err) {
      toast.error('Failed to load map data')
    } finally {
      setLoading(false)
    }
  }

  const getMarkerColor = (severity) => {
    switch (severity) {
      case 'High': return 'red'
      case 'Medium': return 'orange'
      case 'Low': return 'yellow'
      default: return 'green'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-slate-900">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <MapPin className="w-8 h-8 mr-3 text-cyan-400" />
                Detection Map
              </h1>
              <p className="text-slate-400 mt-1">Visualize leak locations on the map</p>
            </div>
          </div>

          {/* Map Container */}
          <div className="glass rounded-3xl p-4">
            <div className="rounded-2xl overflow-hidden" style={{ height: '500px' }}>
              {mapLoaded ? (
                <MapComponent locations={locations} getMarkerColor={getMarkerColor} />
              ) : (
                <div className="h-full flex items-center justify-center bg-slate-800">
                  <div className="text-center">
                    <Navigation className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">Loading map...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
            {[
              { color: 'bg-red-500', label: 'High Severity' },
              { color: 'bg-orange-500', label: 'Medium Severity' },
              { color: 'bg-yellow-500', label: 'Low Severity' },
              { color: 'bg-green-500', label: 'Info' },
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                <span className="text-sm text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Locations List */}
          {locations.length > 0 && (
            <div className="mt-8">
              <h3 className="text-white font-semibold mb-4">Saved Locations ({locations.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map((loc, i) => (
                  <div key={loc.id} className="card flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      loc.severity === 'High' ? 'bg-red-500' :
                      loc.severity === 'Medium' ? 'bg-orange-500' :
                      loc.severity === 'Low' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <div>
                      <p className="text-white text-sm font-medium">{loc.label || 'Unknown'}</p>
                      <p className="text-xs text-slate-400">
                        {loc.location_name || `${loc.lat?.toFixed(4)}, ${loc.lng?.toFixed(4)}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// Separate Map component that uses Leaflet
function MapComponent({ locations, getMarkerColor }) {
  const { MapContainer, TileLayer, Marker, Popup } = window.ReactLeaflet || {}
  const L = window.L

  if (!MapContainer || !L) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-800">
        <p className="text-slate-400">Map library loading...</p>
      </div>
    )
  }

  // Fix default icon
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })

  const center = locations.length > 0
    ? [locations[0].lat, locations[0].lng]
    : [20.5937, 78.9629] // India center

  return (
    <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc) => (
        <Marker key={loc.id} position={[loc.lat, loc.lng]}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{loc.label || 'Detection'}</p>
              <p>Severity: {loc.severity}</p>
              {loc.location_name && <p>Location: {loc.location_name}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {new Date(loc.date).toLocaleDateString()}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}