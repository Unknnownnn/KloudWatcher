"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { disasterTypes } from "@/lib/utils"
import { Brain, CloudLightning } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AIPredictionsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState<any>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const mockPrediction = {
        disasterType: "flood",
        location: "Kerala, India",
        prediction: "Based on the current data, the flood in Kerala, India is predicted to affect approximately 15,000-20,000 people in the next 24-48 hours. The most vulnerable areas include low-lying regions near water bodies and densely populated urban centers. Immediate evacuation is recommended for residents in these areas. Emergency services should prepare for potential infrastructure damage, including power outages and road blockages. Relief centers should be established with capacity for at least 10,000 people.",
        timestamp: new Date().toISOString(),
        affectedAreas: ["Urban centers", "Low-lying regions", "Coastal areas"],
        estimatedPeopleAtRisk: 18500,
        recommendedActions: [
          "Evacuate vulnerable areas",
          "Establish relief centers",
          "Deploy emergency response teams",
          "Prepare medical facilities",
          "Secure critical infrastructure"
        ]
      }
      
      setPrediction(mockPrediction)
      setIsLoading(false)
      toast({
        title: "Prediction Generated",
        description: "AI has successfully generated a disaster impact prediction.",
      })
    }, 2000)
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
                  <Select>
                    <SelectTrigger id="disasterType">
                      <SelectValue placeholder="Select disaster type" />
                    </SelectTrigger>
                    <SelectContent>
                      {disasterTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type\

