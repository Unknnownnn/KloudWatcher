"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Prediction {
  id: string
  created_at: string
  disaster_type: string
  location: string
  prediction: string
  affected_areas: string[]
  estimated_people_at_risk: number
  recommended_actions: string[]
  confidence_score: number
  data_sources: string[]
  status: string
  latitude: number
  longitude: number
  priority: string
  name: string
}

export default function TestingPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPredictions() {
      try {
        console.log('Fetching predictions...')
        const { data, error } = await supabase
          .from('predictions')
          .select('*')

        if (error) {
          console.error('Supabase error:', error)
          setError(error.message)
          return
        }

        console.log('Received data:', data)
        setPredictions(data || [])
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()

    // Set up real-time subscription
    const subscription = supabase
      .channel('predictions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'predictions' },
        (payload) => {
          console.log('Real-time update received:', payload)
          fetchPredictions()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <div className="text-sm text-muted-foreground">Loading data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="mb-6 text-2xl font-bold">Predictions Data</h1>
      
      <div className="space-y-4">
        {predictions.map((prediction) => (
          <div 
            key={prediction.id} 
            className="rounded-lg border p-4 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{prediction.name}</h2>
            <div className="mt-2 grid gap-2 text-sm">
              <p><span className="font-medium">Type:</span> {prediction.disaster_type}</p>
              <p><span className="font-medium">Location:</span> {prediction.location}</p>
              <p><span className="font-medium">Prediction:</span> {prediction.prediction}</p>
              <p><span className="font-medium">Status:</span> {prediction.status}</p>
              <p><span className="font-medium">Priority:</span> {prediction.priority}</p>
              <p><span className="font-medium">Confidence:</span> {prediction.confidence_score}%</p>
              <p><span className="font-medium">People at Risk:</span> {prediction.estimated_people_at_risk.toLocaleString()}</p>
              <p><span className="font-medium">Coordinates:</span> [{prediction.latitude}, {prediction.longitude}]</p>
              <div>
                <p className="font-medium">Affected Areas:</p>
                <ul className="ml-4 list-disc">
                  {prediction.affected_areas.map((area, index) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium">Recommended Actions:</p>
                <ul className="ml-4 list-disc">
                  {prediction.recommended_actions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium">Data Sources:</p>
                <ul className="ml-4 list-disc">
                  {prediction.data_sources.map((source, index) => (
                    <li key={index}>{source}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 