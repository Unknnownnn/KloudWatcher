"use client"

import { useMemo } from 'react'
import dynamic from 'next/dynamic'

// Import the map with no SSR
const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-center">
        <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <div className="text-sm text-muted-foreground">Loading map components...</div>
      </div>
    </div>
  ),
})

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

interface MapWrapperProps {
  disasters: Disaster[]
}

export default function MapWrapper({ disasters }: MapWrapperProps) {
  // Ensure disasters is always a valid array and contains valid coordinates
  const validDisasters = useMemo(() => {
    if (!Array.isArray(disasters)) return []
    
    return disasters.filter(disaster => 
      disaster &&
      typeof disaster.latitude === 'number' && 
      typeof disaster.longitude === 'number' &&
      !isNaN(disaster.latitude) && 
      !isNaN(disaster.longitude)
    )
  }, [disasters])

  // Only render if we have valid data
  if (validDisasters.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/20">
        <div className="text-center p-4">
          <p className="text-muted-foreground">No valid location data available for map</p>
        </div>
      </div>
    )
  }

  return <LeafletMap disasters={validDisasters} />
} 