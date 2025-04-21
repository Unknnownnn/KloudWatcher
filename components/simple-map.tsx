"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  Marker,
  ZoomableGroup 
} from 'react-simple-maps'
import { feature } from 'topojson-client'
import MapTooltip from './map-tooltip'

// Use local map data
const geoUrl = "/world-map.json"

interface Disaster {
  id: string
  latitude: number
  longitude: number
  disaster_type: string
  prediction: string
  name: string
  status: string
  priority: string
  confidence_score: number
  location: string
  estimated_people_at_risk?: number
}

interface SimpleMapProps {
  disasters: Disaster[]
}

export default function SimpleMap({ disasters }: SimpleMapProps) {
  const [position, setPosition] = useState<{
    coordinates: [number, number];
    zoom: number;
  }>({
    coordinates: [0, 0],
    zoom: 1
  })
  
  const [geoData, setGeoData] = useState<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    marker: {
      x: number;
      y: number;
    } | null;
    disaster: Disaster | null;
  }>({
    show: false,
    marker: null,
    disaster: null
  })

  useEffect(() => {
    // Load map data
    fetch(geoUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to load map data")
        }
        return response.json()
      })
      .then(data => {
        if (data.objects && data.objects.countries) {
          // Convert TopoJSON to GeoJSON
          const countries = feature(data, data.objects.countries)
          setGeoData(countries)
        } else {
          // For pre-converted GeoJSON
          setGeoData(data)
        }
        setMapLoaded(true)
      })
      .catch(error => {
        console.error("Error loading map data:", error)
      })
  }, [])

  // Close tooltip when clicking outside marker
  useEffect(() => {
    const handleClickOutside = () => {
      setTooltip(prev => ({ ...prev, show: false }))
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Handle resize to update tooltip position
  useEffect(() => {
    const handleResize = () => {
      setTooltip(prev => ({ ...prev, show: false }))
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle zooming
  const handleZoomIn = () => {
    if (position.zoom >= 8) return
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }))
  }

  const handleZoomOut = () => {
    if (position.zoom <= 0.7) return
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }))
  }

  // Get marker size based on zoom level
  const getMarkerSize = () => {
    const baseSize = 3.5
    const minSize = 2
    const zoomFactor = Math.max(1, position.zoom)
    
    return Math.max(minSize, baseSize / zoomFactor)
  }

  // Convert disaster type to marker color
  const getMarkerColor = (type: string, priority: string) => {
    const typeColors: Record<string, string> = {
      flood: "#3b82f6",
      cyclone: "#ef4444",
      earthquake: "#f97316",
      landslide: "#92400e",
      drought: "#eab308",
      wildfire: "#dc2626", 
      tsunami: "#0ea5e9",
      tornado: "#8b5cf6",
      volcanic_eruption: "#b91c1c"
    }
    
    const priorityColors: Record<string, string> = {
      high: "#dc2626",
      medium: "#f97316",
      low: "#eab308"
    }

    return typeColors[type?.toLowerCase()] || 
           priorityColors[priority?.toLowerCase()] || 
           "#6b7280"
  }

  // Function to get the exact marker position
  const getMarkerPosition = useCallback((element: HTMLElement) => {
    if (!element) return null
    
    const rect = element.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const topY = rect.top
    
    return { x: centerX, y: topY }
  }, [])

  // Handle marker hover
  const handleMarkerMouseEnter = (evt: React.MouseEvent, disaster: Disaster) => {
    // Stop event propagation to prevent closing tooltip
    evt.stopPropagation()
    
    // Get the position of the marker relative to the viewport
    const target = evt.currentTarget as HTMLElement
    const markerPosition = getMarkerPosition(target)
    
    if (!markerPosition) return
    
    setTooltip({
      show: true,
      marker: markerPosition,
      disaster
    })
  }

  const handleMarkerMouseLeave = () => {
    // Only hide on mouse leave if we're not in a touch device
    if ('ontouchstart' in window) return
    
    setTooltip(prev => ({ ...prev, show: false }))
  }

  // Handle marker click for touch devices
  const handleMarkerClick = (evt: React.MouseEvent, disaster: Disaster) => {
    evt.stopPropagation()
    
    // Get the position of the marker relative to the viewport
    const target = evt.currentTarget as HTMLElement
    const markerPosition = getMarkerPosition(target)
    
    if (!markerPosition) return
    
    if (tooltip.show && tooltip.disaster?.id === disaster.id) {
      // Close if clicking the same marker
      setTooltip(prev => ({ ...prev, show: false }))
    } else {
      // Open tooltip for the clicked marker
      setTooltip({
        show: true,
        marker: markerPosition,
        disaster
      })
    }
  }

  if (!mapLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <div className="text-sm text-gray-400">Loading map data...</div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative h-full w-full bg-zinc-950">
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-2">
        <button
          className="rounded-full bg-white p-2 text-black shadow-md"
          onClick={handleZoomIn}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button
          className="rounded-full bg-white p-2 text-black shadow-md"
          onClick={handleZoomOut}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <ComposableMap 
        projection="geoMercator"
        style={{ width: "100%", height: "100%", backgroundColor: "#0f172a" }}
      >
        <ZoomableGroup 
          zoom={position.zoom}
          center={position.coordinates}
          maxZoom={10}
          minZoom={0.7}
          onMoveEnd={({ coordinates, zoom }: { coordinates: [number, number]; zoom: number }) => {
            setPosition({ coordinates, zoom })
            // Hide tooltip when panning/zooming
            setTooltip(prev => ({ ...prev, show: false }))
          }}
        >
          {geoData && (
            <Geographies geography={geoData}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey || geo.properties.iso_a3 || geo.properties.name}
                    geography={geo}
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth={0.3}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", fill: "#334155" },
                      pressed: { outline: "none" }
                    }}
                  />
                ))
              }
            </Geographies>
          )}

          {disasters.map((disaster) => (
            <Marker 
              key={disaster.id} 
              coordinates={[disaster.longitude, disaster.latitude]}
              onMouseEnter={(evt) => handleMarkerMouseEnter(evt, disaster)}
              onMouseLeave={handleMarkerMouseLeave}
              onClick={(evt) => handleMarkerClick(evt, disaster)}
            >
              <circle 
                r={getMarkerSize()} 
                fill={getMarkerColor(disaster.disaster_type, disaster.priority)} 
                stroke="#fff" 
                strokeWidth={0.8}
                style={{ cursor: "pointer" }}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {tooltip.show && tooltip.disaster && tooltip.marker && (
        <MapTooltip 
          x={tooltip.marker.x} 
          y={tooltip.marker.y} 
          disaster={tooltip.disaster}
        />
      )}
    </div>
  )
} 