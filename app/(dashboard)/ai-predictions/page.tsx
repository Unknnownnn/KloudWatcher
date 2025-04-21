"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { disasterTypes } from "@/lib/utils"
import { Brain, CloudLightning } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import type { Prediction } from "@/lib/supabase"
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export default function AIPredictionsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [selectedType, setSelectedType] = useState<string>("")
  const { toast } = useToast()

  // Verify Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('predictions')
          .select('*')
          .limit(1)
        
        if (error) {
          console.error('Supabase connection error:', error)
          toast({
            title: "Connection Error",
            description: "Failed to connect to the database. Please check your configuration.",
            variant: "destructive",
          })
        } else {
          console.log('Supabase connected successfully:', data)
        }
      } catch (error) {
        console.error('Failed to check Supabase connection:', error)
      }
    }

    checkConnection()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedType) {
      toast({
        title: "Error",
        description: "Please select a disaster type",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      console.log('Submitting prediction request for type:', selectedType)

      // Create initial prediction
      const initialPrediction = {
        disaster_type: selectedType,
        status: 'pending',
        location: 'Processing...',
        prediction: 'Analyzing data...',
        affected_areas: [],
        estimated_people_at_risk: 0,
        recommended_actions: [],
        confidence_score: 0,
        data_sources: []
      }

      // Insert a new prediction request
      const { data, error } = await supabase
        .from('predictions')
        .insert(initialPrediction)
        .select()
        .single()

      console.log('Supabase insert response:', { data, error })

      if (error) {
        console.error('Supabase insert error:', error)
        throw error
      }

      // Set initial prediction state
      setPrediction(data as Prediction)

      // Subscribe to real-time updates for this prediction
      const predictionSubscription = supabase
        .channel('prediction-update')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'predictions',
            filter: `id=eq.${data.id}`
          },
          (payload: RealtimePostgresChangesPayload<Prediction>) => {
            console.log('Received real-time update:', payload)
            if (payload.new && payload.new.status === 'completed') {
              setPrediction(payload.new as Prediction)
              toast({
                title: "Prediction Generated",
                description: "AI has successfully generated a disaster impact prediction.",
              })
            }
          }
        )
        .subscribe()

      console.log('Subscribed to real-time updates')

      // Simulate prediction completion (remove this in production)
      setTimeout(async () => {
        const mockUpdate = {
          ...initialPrediction,
          id: data.id,
          status: 'completed',
          location: "Kerala, India",
          prediction: "Based on current data, expecting severe flooding in coastal regions...",
          affected_areas: ["Coastal Areas", "Low-lying Regions"],
          estimated_people_at_risk: 15000,
          recommended_actions: ["Evacuate coastal areas", "Prepare emergency shelters"],
          confidence_score: 85,
          data_sources: ["Weather Data", "Historical Records"]
        }

        const { error: updateError } = await supabase
          .from('predictions')
          .update(mockUpdate)
          .eq('id', data.id)

        if (updateError) {
          console.error('Error updating prediction:', updateError)
        }
      }, 3000)

      // Cleanup subscription
      return () => {
        console.log('Cleaning up subscription')
        predictionSubscription.unsubscribe()
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to generate prediction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <CloudLightning className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">KloudWatcher</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <img
              src="/placeholder.svg?height=32&width=32"
              width="32"
              height="32"
              className="rounded-full border"
              alt="Avatar"
            />
            <span className="sr-only">Profile</span>
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">AI Predictions</h1>
          <Brain className="h-6 w-6 text-primary" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle>Generate Prediction</CardTitle>
              <CardDescription>
                Use AI to predict disaster impact and recommend actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="disasterType">Disaster Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger id="disasterType">
                      <SelectValue placeholder="Select disaster type" />
                    </SelectTrigger>
                    <SelectContent>
                      {disasterTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Generating..." : "Generate Prediction"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {prediction && (
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Prediction Results</CardTitle>
                <CardDescription>
                  AI-generated disaster impact prediction and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Location</h3>
                  <p>{prediction.location}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Prediction</h3>
                  <p>{prediction.prediction}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Affected Areas</h3>
                  <ul className="list-inside list-disc">
                    {prediction.affected_areas.map((area: string) => (
                      <li key={area}>{area}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Recommended Actions</h3>
                  <ul className="list-inside list-disc">
                    {prediction.recommended_actions.map((action: string) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Confidence Score</h3>
                  <p>{prediction.confidence_score}%</p>
                </div>
                <div>
                  <h3 className="font-semibold">Data Sources</h3>
                  <ul className="list-inside list-disc">
                    {prediction.data_sources.map((source: string) => (
                      <li key={source}>{source}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

