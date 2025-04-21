"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from '@supabase/supabase-js'
import SimpleMap from './simple-map'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
  estimated_people_at_risk: number
  affected_areas?: string[]
  recommended_actions?: string[]
  data_sources?: string[]
  created_at?: string
}

export default function DashboardMap() {
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use useCallback to memoize the fetch function
  const fetchDisasters = useCallback(async () => {
    try {
      console.log('Fetching disaster data...')
      setIsLoaded(false)
      
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
      
      if (error) {
        console.error('Supabase error:', error)
        setError(error.message)
        return
      }
      
      console.log(`Received ${data?.length || 0} disaster records:`, data)
      
      // Validate and transform the data to ensure it matches our interface
      const validDisasters = (data || [])
        .filter(item => {
          return (
            item && 
            typeof item.latitude === 'number' && 
            typeof item.longitude === 'number' &&
            !isNaN(item.latitude) && 
            !isNaN(item.longitude)
          )
        })
        .map(item => ({
          id: item.id,
          latitude: item.latitude,
          longitude: item.longitude,
          disaster_type: item.disaster_type,
          prediction: item.prediction,
          name: item.name,
          status: item.status,
          priority: item.priority,
          confidence_score: item.confidence_score || 0,
          location: item.location || 'Unknown',
          estimated_people_at_risk: item.estimated_people_at_risk || 0,
          affected_areas: item.affected_areas,
          recommended_actions: item.recommended_actions,
          data_sources: item.data_sources,
          created_at: item.created_at
        }))
      
      console.log(`${validDisasters.length} valid disaster records after filtering`)
      setDisasters(validDisasters)
    } catch (err) {
      console.error('Error fetching disasters:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    fetchDisasters()

    const subscription = supabase
      .channel('predictions-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'predictions' },
        (payload) => {
          console.log('Real-time update received:', payload)
          fetchDisasters()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchDisasters])

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="rounded-md bg-red-50 p-4 text-red-600">
          <h3 className="font-semibold">Error loading map data</h3>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <div className="text-sm text-muted-foreground">Loading disaster data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md">
      {disasters.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center bg-muted/20">
          <div className="text-center p-4">
            <p className="text-muted-foreground">No disaster data available</p>
          </div>
        </div>
      ) : (
        <SimpleMap disasters={disasters} />
      )}
    </div>
  )
}




