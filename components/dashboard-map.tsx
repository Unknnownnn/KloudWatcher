"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"

// In a real application, we would use Mapbox or another mapping library
// For this demo, we'll create a simplified map visualization

export default function DashboardMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [mapHtml, setMapHtml] = useState<string>("")

  useEffect(() => {
    const fetchMap = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/map')
        const data = await response.json()
        setMapHtml(data.map_html)
        setIsLoaded(true)
      } catch (error) {
        console.error('Error fetching map:', error)
      }
    }

    fetchMap()
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md bg-gray-100">
      {!isLoaded ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      ) : (
        <div 
          className="relative h-full w-full" 
          ref={mapContainer}
          dangerouslySetInnerHTML={{ __html: mapHtml }}
        />
      )}
    </div>
  )
}

