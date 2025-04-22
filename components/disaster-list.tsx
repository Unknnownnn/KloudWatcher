"use client"

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
import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from '@supabase/supabase-js'
import { Input } from "@/components/ui/input"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Disaster {
  id: string
  name: string
  disaster_type: string
  location: string
  severity: string
  created_at: string
  status: string
  estimated_people_at_risk: number
  recommended_actions: string[]
  priority: string
}

interface Resource {
  id: string
  type: string
  name: string
  available_units: number
  allocated_units: number
}

export default function DisasterList() {
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalDisasters, setTotalDisasters] = useState(0)
  const [selectedResources, setSelectedResources] = useState<{ [key: string]: string[] }>({})
  const [resourceAmounts, setResourceAmounts] = useState<{ [key: string]: { [resourceId: string]: number } }>({})
  const [isResponding, setIsResponding] = useState(false)
  const [responseStatus, setResponseStatus] = useState<{ [key: string]: 'pending' | 'success' | 'error' | null }>({})

  // Fetch disasters and resources from Supabase
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // First get total count of all disasters
      const { count: totalCount } = await supabase
        .from('predictions')
        .select('*', { count: 'exact', head: true })
      
      setTotalDisasters(totalCount || 0)
      
      // Get both active and responding disasters
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .in('status', ['active', 'responding'])
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching disasters:', error)
        toast.error('Failed to load disaster data')
        return
      }
      
      // Transform data for our component
      const transformedData = data.map(item => ({
        id: item.id,
        name: item.name,
        disaster_type: item.disaster_type,
        location: item.location,
        severity: item.priority === 'high' ? 'critical' : 
                 item.priority === 'medium' ? 'high' : 'medium',
        created_at: item.created_at,
        status: item.status,
        estimated_people_at_risk: item.estimated_people_at_risk,
        recommended_actions: item.recommended_actions || [],
        priority: item.priority
      }))
      
      console.log('Fetched disasters:', transformedData)
      setDisasters(transformedData)

      // Fetch resources
      const { data: resourceData, error: resourceError } = await supabase
        .from('resources')
        .select('*')
        .order('type')
      
      if (resourceError) {
        console.error('Error fetching resources:', resourceError)
        toast.error('Failed to load resource data')
        return
      }
      
      setResources(resourceData || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      toast.error('Failed to load disaster data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    
    // Set up real-time subscription for updates
    const disasterSubscription = supabase
      .channel('predictions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'predictions' },
        (payload) => {
          console.log('Real-time update received:', payload)
          fetchData()
        }
      )
      .subscribe()
      
    const resourceSubscription = supabase
      .channel('resources-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'resources' },
        (payload) => {
          console.log('Resource update received:', payload)
          fetchData()
        }
      )
      .subscribe()
      
    return () => {
      disasterSubscription.unsubscribe()
      resourceSubscription.unsubscribe()
    }
  }, [fetchData])

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Active</Badge>
      case "responding":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Responding</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleResourceSelect = (disasterId: string, resourceType: string) => {
    setSelectedResources(prev => ({
      ...prev,
      [disasterId]: prev[disasterId]
        ? prev[disasterId].includes(resourceType)
          ? prev[disasterId].filter(r => r !== resourceType)
          : [...prev[disasterId], resourceType]
        : [resourceType]
    }))
    
    // Initialize amount for this resource if it's newly selected
    if (!selectedResources[disasterId]?.includes(resourceType)) {
      setResourceAmounts(prev => ({
        ...prev,
        [disasterId]: {
          ...(prev[disasterId] || {}),
          [resourceType]: 0
        }
      }))
    }
  }

  const handleAmountChange = (disasterId: string, resourceType: string, amount: number) => {
    // Get the resource data
    const resource = resources.find(r => r.type === resourceType)
    
    // Check if amount exceeds available units
    if (resource && amount > resource.available_units) {
      toast.error(`Only ${resource.available_units} units of ${resource.name} available`)
      amount = resource.available_units
    }
    
    if (amount < 0) amount = 0
    
    setResourceAmounts(prev => ({
      ...prev,
      [disasterId]: {
        ...(prev[disasterId] || {}),
        [resourceType]: amount
      }
    }))
  }

  const handleRespond = async (disasterId: string) => {
    setIsResponding(true)
    setResponseStatus(prev => ({ ...prev, [disasterId]: 'pending' }))
    
    try {
      // Get selected resources with amounts
      const selectedWithAmounts = selectedResources[disasterId]?.map(resourceType => {
        const amount = resourceAmounts[disasterId]?.[resourceType] || 0
        const resource = resources.find(r => r.type === resourceType)
        return {
          type: resourceType,
          name: resource?.name || resourceType,
          amount
        }
      }).filter(r => r.amount > 0) || []
      
      if (selectedWithAmounts.length === 0) {
        throw new Error('Please specify amounts for selected resources')
      }
      
      // Update status in Supabase
      const { error } = await supabase
        .from('predictions')
        .update({ 
          status: 'responding',
          // Store the selected actions in a response_actions field
          response_actions: selectedWithAmounts.map(r => `${r.name} (${r.amount} units)`)
        })
        .eq('id', disasterId)
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Update resource allocations
      for (const resource of selectedWithAmounts) {
        const resourceData = resources.find(r => r.type === resource.type)
        if (resourceData) {
          // Update resource allocation
          await supabase
            .from('resources')
            .update({
              available_units: resourceData.available_units - resource.amount,
              allocated_units: resourceData.allocated_units + resource.amount
            })
            .eq('id', resourceData.id)
            
          // Create resource request record for tracking
          await supabase
            .from('resource_requests')
            .insert({
              disaster_id: disasterId,
              resource_type: resource.type,
              requested_units: resource.amount,
              status: 'approved'
            })
        }
      }
      
      toast.success('Response initiated successfully')
      setSelectedResources(prev => ({
        ...prev,
        [disasterId]: []
      }))
      setResourceAmounts(prev => ({
        ...prev,
        [disasterId]: {}
      }))
      setResponseStatus(prev => ({ ...prev, [disasterId]: 'success' }))
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to respond to disaster. Please try again.')
      setResponseStatus(prev => ({ ...prev, [disasterId]: 'error' }))
    } finally {
      setIsResponding(false)
      // Refresh the disaster list
      fetchData()
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <div className="text-sm text-muted-foreground">Loading disaster data...</div>
        </div>
      </div>
    )
  }

  if (disasters.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <p className="text-muted-foreground">No active or responding disasters found</p>
          <p className="text-xs text-muted-foreground mt-1">Total disasters in database: {totalDisasters}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-muted-foreground">
          Showing {disasters.length} disasters (Total: {totalDisasters})
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {disasters.map((disaster) => (
          <div key={disaster.id} className="rounded-lg border shadow-sm p-4 bg-card">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-lg">{disaster.name}</div>
              <Badge className={getSeverityColor(disaster.severity)}>
                {disaster.severity.charAt(0).toUpperCase() + disaster.severity.slice(1)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
              <div className="text-muted-foreground">Type:</div>
              <div className="capitalize">{disaster.disaster_type}</div>
              <div className="text-muted-foreground">Location:</div>
              <div>{disaster.location}</div>
              <div className="text-muted-foreground">Started:</div>
              <div>{formatDate(new Date(disaster.created_at))}</div>
              <div className="text-muted-foreground">Affected:</div>
              <div>{disaster.estimated_people_at_risk.toLocaleString()} people</div>
              <div className="text-muted-foreground">Status:</div>
              <div>{getStatusBadge(disaster.status)}</div>
            </div>
            {responseStatus[disaster.id] === 'success' && (
              <Alert className="bg-green-50 mb-3">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Response Initiated</AlertTitle>
                <AlertDescription>
                  Resources have been allocated and response teams have been notified.
                </AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1">
                Details
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm"
                    variant={disaster.status === 'responding' ? "outline" : "default"}
                    disabled={disaster.status === 'responding' && !responseStatus[disaster.id]}
                  >
                    {disaster.status === 'responding' ? 'Update Response' : 'Respond'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Respond to {disaster.name}</DialogTitle>
                    <DialogDescription>
                      Select resources and specify amounts to deploy
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {resources.length > 0 ? (
                      resources.map((resource) => (
                        <div key={resource.type} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${disaster.id}-${resource.type}`}
                              checked={selectedResources[disaster.id]?.includes(resource.type)}
                              onCheckedChange={() => handleResourceSelect(disaster.id, resource.type)}
                            />
                            <label
                              htmlFor={`${disaster.id}-${resource.type}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {resource.name} ({resource.available_units} available)
                            </label>
                          </div>
                          {selectedResources[disaster.id]?.includes(resource.type) && (
                            <div className="flex items-center ml-6 gap-2">
                              <Input 
                                type="number"
                                className="w-24 h-8"
                                min={0}
                                max={resource.available_units}
                                value={resourceAmounts[disaster.id]?.[resource.type] || 0}
                                onChange={(e) => handleAmountChange(
                                  disaster.id, 
                                  resource.type, 
                                  parseInt(e.target.value) || 0
                                )}
                              />
                              <span className="text-sm text-muted-foreground">units</span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No resources available. Please add resources first.
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => handleRespond(disaster.id)}
                      disabled={
                        isResponding || 
                        !selectedResources[disaster.id]?.length ||
                        !selectedResources[disaster.id]?.some(
                          resourceType => (resourceAmounts[disaster.id]?.[resourceType] || 0) > 0
                        )
                      }
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
    </div>
  )
}

