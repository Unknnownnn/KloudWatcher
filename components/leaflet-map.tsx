"use client"

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Handle Leaflet marker icons
function fixLeafletIcons() {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/marker-icon-2x.png',
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
  })
}

interface Disaster {
  id: string
  latitude: number
  longitude: number
  disaster_type: string
  prediction: string
  name: string
  status: string
  priority: string
}

interface LeafletMapProps {
  disasters: Disaster[]
}

// MapMarkers component to handle markers separately
function MapMarkers({ disasters }: LeafletMapProps) {
  return (
    <>
      {disasters.map((disaster) => (
        <Marker
          key={disaster.id}
          position={[disaster.latitude, disaster.longitude]}
        >
          <Popup>
            <div>
              <h3 className="font-semibold">{disaster.name}</h3>
              <p className="text-sm font-medium">Type: {disaster.disaster_type}</p>
              <p className="text-sm">{disaster.prediction}</p>
              <p className="text-sm mt-1">Status: <span className="font-medium">{disaster.status}</span></p>
              <p className="text-sm">Priority: <span className="font-medium">{disaster.priority}</span></p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}

export default function LeafletMap({ disasters }: LeafletMapProps) {
  const [mounted, setMounted] = useState(false)
  const mapInitialized = useRef(false)

  useEffect(() => {
    if (!mapInitialized.current) {
      try {
        // Fix Leaflet icons
        fixLeafletIcons()
        mapInitialized.current = true
      } catch (err) {
        console.error('Error initializing Leaflet:', err)
      }
    }
    
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <div className="text-sm text-muted-foreground">Initializing map...</div>
        </div>
      </div>
    )
  }

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {disasters && disasters.length > 0 && <MapMarkers disasters={disasters} />}
    </MapContainer>
  )
} 