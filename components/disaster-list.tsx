import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DisasterList() {
  const [selectedResources, setSelectedResources] = useState<{ [key: string]: string[] }>({})
  const [isResponding, setIsResponding] = useState(false)
  const [responseStatus, setResponseStatus] = useState<{ [key: string]: 'pending' | 'success' | 'error' | null }>({})

  const disasters = [
    {
      id: 1,
      name: "Kerala Floods",
      type: "flood",
      location: "Kerala, India",
      severity: "critical",
      startDate: new Date("2023-06-12"),
      status: "active",
      affectedCount: 12450,
      availableResources: ["food", "water", "medical supplies", "shelter", "rescue equipment"]
    },
    {
      id: 2,
      name: "Cyclone Amphan",
      type: "cyclone",
      location: "West Bengal, India",
      severity: "high",
      startDate: new Date("2023-05-20"),
      status: "active",
      affectedCount: 8750,
      availableResources: ["shelter", "medical supplies", "rescue equipment", "food"]
    },
    {
      id: 3,
      name: "Uttarakhand Landslide",
      type: "landslide",
      location: "Uttarakhand, India",
      severity: "medium",
      startDate: new Date("2023-07-05"),
      status: "active",
      affectedCount: 3389,
      availableResources: ["rescue equipment", "medical supplies", "shelter"]
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500"
      default:
        return "bg-blue-500 text-white"
    }
  }

  const handleResourceSelect = (disasterId: number, resource: string) => {
    setSelectedResources(prev => ({
      ...prev,
      [disasterId]: prev[disasterId]
        ? prev[disasterId].includes(resource)
          ? prev[disasterId].filter(r => r !== resource)
          : [...prev[disasterId], resource]
        : [resource]
    }))
  }

  const handleRespond = async (disasterId: number) => {
    setIsResponding(true)
    setResponseStatus(prev => ({ ...prev, [disasterId]: 'pending' }))
    
    try {
      const response = await fetch(`http://localhost:8000/api/disasters/${disasterId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resources: selectedResources[disasterId] || [] }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success(data.message)
        setSelectedResources(prev => ({
          ...prev,
          [disasterId]: []
        }))
        setResponseStatus(prev => ({ ...prev, [disasterId]: 'success' }))
      } else {
        throw new Error(data.detail || 'Failed to respond to disaster')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to respond to disaster. Please try again.')
      setResponseStatus(prev => ({ ...prev, [disasterId]: 'error' }))
    } finally {
      setIsResponding(false)
    }
  }

  return (
    <div className="space-y-4">
      {disasters.map((disaster) => (
        <div key={disaster.id} className="flex flex-col space-y-2 border-b pb-4 last:border-0">
          <div className="flex items-center justify-between">
            <div className="font-medium">{disaster.name}</div>
            <Badge className={getSeverityColor(disaster.severity)}>
              {disaster.severity.charAt(0).toUpperCase() + disaster.severity.slice(1)}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div className="text-muted-foreground">Type:</div>
            <div className="capitalize">{disaster.type}</div>
            <div className="text-muted-foreground">Location:</div>
            <div>{disaster.location}</div>
            <div className="text-muted-foreground">Started:</div>
            <div>{formatDate(disaster.startDate)}</div>
            <div className="text-muted-foreground">Affected:</div>
            <div>{disaster.affectedCount.toLocaleString()} people</div>
          </div>
          {responseStatus[disaster.id] === 'success' && (
            <Alert className="bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Response Initiated</AlertTitle>
              <AlertDescription>
                Resources have been allocated and response teams have been notified.
              </AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm">
              Details
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  size="sm"
                  variant={responseStatus[disaster.id] === 'success' ? "outline" : "default"}
                >
                  {responseStatus[disaster.id] === 'success' ? 'Update Response' : 'Respond'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Respond to {disaster.name}</DialogTitle>
                  <DialogDescription>
                    Select resources to deploy for this disaster response
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {disaster.availableResources.map((resource) => (
                    <div key={resource} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${disaster.id}-${resource}`}
                        checked={selectedResources[disaster.id]?.includes(resource)}
                        onCheckedChange={() => handleResourceSelect(disaster.id, resource)}
                      />
                      <label
                        htmlFor={`${disaster.id}-${resource}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {resource.charAt(0).toUpperCase() + resource.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => handleRespond(disaster.id)}
                    disabled={isResponding || !selectedResources[disaster.id]?.length}
                  >
                    {isResponding ? "Responding..." : "Confirm Response"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ))}
    </div>
  )
}

