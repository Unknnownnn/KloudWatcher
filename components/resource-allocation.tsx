"use client"

import { useRef, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function ResourceAllocation() {
  const chartRef = useRef<HTMLDivElement>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [resourceAmounts, setResourceAmounts] = useState<{ [key: string]: { [key: string]: number } }>({})
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const responses = await Promise.all([1, 2, 3].map(id => 
          fetch(`http://localhost:8000/api/disasters/${id}/resources`)
            .then(res => res.json())
        ))
        
        const newResourceAmounts: { [key: string]: { [key: string]: number } } = {}
        responses.forEach(response => {
          newResourceAmounts[response.disaster_name] = response.allocated_resources
        })
        
        setResourceAmounts(newResourceAmounts)
        setLastUpdated(new Date())
      } catch (error) {
        console.error('Error fetching resources:', error)
        toast.error('Failed to load resource data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResources()
  }, [])

  const handleUpdateResources = async (disaster: string, resources: { [key: string]: number }) => {
    setIsUpdating(true)
    try {
      const disasterId = {
        "Kerala Floods": 1,
        "Cyclone Amphan": 2,
        "Uttarakhand Landslide": 3
      }[disaster]

      const response = await fetch(`http://localhost:8000/api/disasters/${disasterId}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resources }),
      })

      const data = await response.json()

      if (response.ok) {
        setResourceAmounts(prev => ({
          ...prev,
          [disaster]: resources
        }))
        setLastUpdated(new Date())
        toast.success(data.message)
      } else {
        throw new Error(data.detail || 'Failed to update resources')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update resources. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const totalResources = Object.values(resourceAmounts).reduce((sum, disaster) => 
    sum + Object.values(disaster).reduce((a, b) => a + b, 0), 0
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(resourceAmounts).map(([disaster, data]) => (
          <Card key={disaster} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">{disaster}</h4>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Manage</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Manage Resources - {disaster}</DialogTitle>
                    <DialogDescription>
                      Update resource allocation for this disaster
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {Object.entries(data).map(([resource, amount]) => (
                      <div key={resource} className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`${disaster}-${resource}`} className="text-right capitalize">
                          {resource}:
                        </Label>
                        <Input
                          id={`${disaster}-${resource}`}
                          type="number"
                          className="col-span-3"
                          defaultValue={amount}
                          onChange={(e) => {
                            const newAmount = parseInt(e.target.value) || 0
                            setResourceAmounts(prev => ({
                              ...prev,
                              [disaster]: {
                                ...prev[disaster],
                                [resource]: newAmount
                              }
                            }))
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => handleUpdateResources(disaster, data)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Updating..." : "Update Resources"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              {Object.entries(data).map(([resource, amount]) => (
                <div key={resource} className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        resource === 'food' ? 'bg-blue-500' :
                        resource === 'medical' ? 'bg-green-500' :
                        resource === 'shelter' ? 'bg-yellow-500' :
                        resource === 'rescue' ? 'bg-red-500' :
                        'bg-purple-500'
                      }`}
                      style={{ width: `${(amount / 400) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs whitespace-nowrap capitalize">{resource}: {amount}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between text-sm text-muted-foreground mt-4">
        <div>Total Resources Allocated: {totalResources}</div>
        <div>Last Updated: {formatTimeAgo(lastUpdated)}</div>
      </div>
    </div>
  )
}

function formatTimeAgo(date: Date) {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes === 1) return '1 minute ago'
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours === 1) return '1 hour ago'
  if (diffInHours < 24) return `${diffInHours} hours ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return '1 day ago'
  return `${diffInDays} days ago'`
}

