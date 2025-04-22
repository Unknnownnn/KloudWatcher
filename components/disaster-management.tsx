"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Plus } from "lucide-react"
import { toast } from "sonner"
import { formatDate, resourceTypes } from "@/lib/utils"
import { createClient } from '@supabase/supabase-js'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  response_actions?: string[]
}

interface Resource {
  id: string
  type: string
  name: string
  available_units: number
  allocated_units: number
}

export default function DisasterManagement() {
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedResources, setSelectedResources] = useState<{ [key: string]: string[] }>({})
  const [resourceAmounts, setResourceAmounts] = useState<{ [key: string]: { [resourceId: string]: number } }>({})
  const [isResponding, setIsResponding] = useState(false)
  const [responseStatus, setResponseStatus] = useState<{ [key: string]: 'pending' | 'success' | 'error' | null }>({})
  
  // New state for quick resource addition
  const [addResourceOpen, setAddResourceOpen] = useState(false)
  const [selectedResourceType, setSelectedResourceType] = useState("")
  const [resourceAmount, setResourceAmount] = useState<number>(100)
  const [isAddingResource, setIsAddingResource] = useState(false)
  const [currentDisasterId, setCurrentDisasterId] = useState<string | null>(null)
  
  // State for success confirmation
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [allocatedResources, setAllocatedResources] = useState<{name: string, amount: number}[]>([])
  const [allocatedDisasterName, setAllocatedDisasterName] = useState("")

  // Generate a unique ID for local resources
  const generateLocalId = () => `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Fetch disasters from Supabase
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Get disasters
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .in('status', ['active', 'responding','completed'])
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
        response_actions: item.response_actions || [],
        priority: item.priority
      }))
      
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
        return <span className="text-red-500 font-medium">Active</span>
      case "responding":
        return <span className="text-blue-500 font-medium">Responding</span>
      case "completed":
        return <span className="text-green-500 font-medium">Completed</span>
      default:
        return <span>{status}</span>
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
      const updatedResources = [...resources];
      
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
            
          // Update local state to reflect changes immediately
          const index = updatedResources.findIndex(r => r.id === resourceData.id);
          if (index !== -1) {
            updatedResources[index] = {
              ...resourceData,
              available_units: resourceData.available_units - resource.amount,
              allocated_units: resourceData.allocated_units + resource.amount
            };
          }
            
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
      
      // Update our local resources state
      setResources(updatedResources);
      
      // Get disaster name for success notification
      const disaster = disasters.find(d => d.id === disasterId);
      
      // Set up the success dialog data
      setAllocatedDisasterName(disaster?.name || "");
      setAllocatedResources(selectedWithAmounts.map(res => ({
        name: res.name,
        amount: res.amount
      })));
      setSuccessDialogOpen(true);
      
      // Calculate total resources allocated
      const totalResourcesAllocated = selectedWithAmounts.reduce((total, resource) => total + resource.amount, 0);
      
      // Show toast notification in addition to dialog
      toast.success(
        <div className="flex flex-col">
          <span className="font-medium">Resources allocated to {disaster?.name}</span>
          <span className="text-xs">{totalResourcesAllocated} total units allocated</span>
        </div>
      );
      
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

  const handleMarkComplete = async (disasterId: string) => {
    try {
      const { error } = await supabase
        .from('predictions')
        .update({ 
          status: 'completed',
        })
        .eq('id', disasterId)
      
      if (error) {
        throw new Error(error.message)
      }
      
      toast.success('Disaster marked as complete')
      fetchData()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update disaster status')
    }
  }

  // Function to handle adding a new resource
  const handleAddNewResource = async () => {
    setIsAddingResource(true)
    
    try {
      if (!selectedResourceType) {
        toast.error('Please select a resource type')
        return
      }
      
      if (resourceAmount <= 0) {
        toast.error('Please enter a valid amount')
        return
      }
      
      const resourceType = resourceTypes.find(r => r.value === selectedResourceType)
      if (!resourceType) {
        toast.error('Invalid resource type')
        return
      }
      
      // Check if resource already exists
      const existingResource = resources.find(r => r.type === selectedResourceType)
      
      if (existingResource) {
        // Resource exists, just update the amount
        try {
          const { error } = await supabase
            .from('resources')
            .update({
              available_units: existingResource.available_units + resourceAmount
            })
            .eq('id', existingResource.id)
            
          if (error) throw error
          
          toast.success(`Added ${resourceAmount} units to ${resourceType.label}`)
        } catch (error) {
          console.error('Supabase update failed:', error)
          toast.error('Failed to update resource')
          return
        }
      } else {
        // Create a new resource
        try {
          const { error } = await supabase
            .from('resources')
            .insert({
              type: selectedResourceType,
              name: resourceType.label,
              available_units: resourceAmount,
              allocated_units: 0
            })
            
          if (error) throw error
          
          toast.success(`Created new resource: ${resourceType.label}`)
        } catch (error) {
          console.error('Supabase insert failed:', error)
          toast.error('Failed to create resource')
          return
        }
      }
      
      // Reset form and close dialog
      setSelectedResourceType("")
      setResourceAmount(100)
      setAddResourceOpen(false)
      
      // Refresh data
      await fetchData()
      
      // Set up success dialog data (always show the success dialog regardless of currentDisasterId)
      setAllocatedDisasterName(currentDisasterId ? disasters.find(d => d.id === currentDisasterId)?.name || "" : "")
      setAllocatedResources([{
        name: resourceType.label,
        amount: resourceAmount
      }])
      setSuccessDialogOpen(true)
      
      // Auto-select the newly added resource for the current disaster if we're adding from a disaster context
      if (currentDisasterId) {
        // Find the resource we just added
        const { data: refreshedResources } = await supabase
          .from('resources')
          .select('*')
          .order('type')
        
        if (refreshedResources) {
          const newResource = refreshedResources.find(r => r.type === selectedResourceType)
          
          if (newResource) {
            // Select this resource for the current disaster
            setSelectedResources(prev => ({
              ...prev,
              [currentDisasterId]: [...(prev[currentDisasterId] || []), newResource.type]
            }))
            
            // Initialize the amount to 0
            setResourceAmounts(prev => ({
              ...prev,
              [currentDisasterId]: {
                ...(prev[currentDisasterId] || {}),
                [newResource.type]: 0
              }
            }))
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add resource')
    } finally {
      setIsAddingResource(false)
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
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">Disaster Management</h2>
        <Button>Add New Disaster</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {disasters.map((disaster) => (
          <Card key={disaster.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>{disaster.name}</CardTitle>
                <Badge className={getSeverityColor(disaster.severity)}>
                  {disaster.severity.charAt(0).toUpperCase() + disaster.severity.slice(1)}
                </Badge>
              </div>
              <CardDescription>Started: {formatDate(new Date(disaster.created_at))}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="capitalize">{disaster.disaster_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Location:</span>
                  <span>{disaster.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Affected:</span>
                  <span>{disaster.estimated_people_at_risk.toLocaleString()} people</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  {getStatusBadge(disaster.status)}
                </div>
              </div>
              
              {disaster.response_actions && disaster.response_actions.length > 0 && (
                <div className="mt-3 space-y-1">
                  <span className="text-sm font-medium">Allocated Resources:</span>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                    {disaster.response_actions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {responseStatus[disaster.id] === 'success' && (
                <Alert className="bg-green-50 mt-3 mb-2">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle>Response Initiated</AlertTitle>
                  <AlertDescription>
                    Resources have been allocated for this disaster.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Details
                </Button>
                
                {disaster.status !== 'completed' && (
                  <>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="flex-1"
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
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Available Resources</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 px-2"
                                  onClick={fetchData}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
                                  Refresh
                                </Button>
                              </div>
                              {resources.map((resource) => (
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
                              ))}
                            </>
                          ) : (
                            <div className="space-y-4">
                              <div className="text-sm text-muted-foreground">
                                No resources available. Add resources to continue.
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => {
                                  setCurrentDisasterId(disaster.id)
                                  setAddResourceOpen(true)
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Allocate Resources
                              </Button>
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
                    
                    {disaster.status === 'responding' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => handleMarkComplete(disaster.id)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Resource Allocation Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {allocatedResources.length === 1 && allocatedResources[0].amount === resourceAmount
                ? 'Resource Added Successfully'
                : 'Resource Allocation Successful'
              }
            </DialogTitle>
            <DialogDescription>
              {allocatedResources.length === 1 && allocatedResources[0].amount === resourceAmount
                ? `${allocatedResources[0].name} has been added and is ready to be allocated to ${allocatedDisasterName}.`
                : `Resources have been successfully allocated to ${allocatedDisasterName}.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">
                  {allocatedResources.length === 1 && allocatedResources[0].amount === resourceAmount
                    ? 'Added resource:'
                    : 'Resources allocated:'
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  {allocatedResources.reduce((total, r) => total + r.amount, 0)} total units
                </div>
              </div>
              <div className="max-h-[200px] overflow-auto rounded-md border p-4">
                {allocatedResources.map((resource, index) => (
                  <div key={index} className="flex justify-between py-2 border-b last:border-0">
                    <span className="font-medium">{resource.name}</span>
                    <span>{resource.amount} units</span>
                  </div>
                ))}
              </div>
              <Alert className={allocatedResources.length === 1 && allocatedResources[0].amount === resourceAmount 
                ? "bg-green-50" 
                : "bg-blue-50"
              }>
                <AlertCircle className={allocatedResources.length === 1 && allocatedResources[0].amount === resourceAmount
                  ? "h-4 w-4 text-green-600"
                  : "h-4 w-4 text-blue-600"
                } />
                <AlertTitle className={allocatedResources.length === 1 && allocatedResources[0].amount === resourceAmount
                  ? "text-green-800"
                  : "text-blue-800"
                }>
                  {allocatedResources.length === 1 && allocatedResources[0].amount === resourceAmount
                    ? "Resource Ready"
                    : "Allocation Complete"
                  }
                </AlertTitle>
                <AlertDescription className={allocatedResources.length === 1 && allocatedResources[0].amount === resourceAmount
                  ? "text-green-700"
                  : "text-blue-700"
                }>
                  {allocatedResources.length === 1 && allocatedResources[0].amount === resourceAmount
                    ? "This resource has been added to your inventory. You can now specify how many units to allocate to this disaster."
                    : "These resources have been deducted from your available inventory and are now allocated to this disaster."
                  }
                </AlertDescription>
              </Alert>
              
              {!(allocatedResources.length === 1 && allocatedResources[0].amount === resourceAmount) && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-400">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Disaster response initiated</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>The disaster status has been updated to "responding" and these resources are now tracked in your resource management dashboard.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button 
              onClick={() => setSuccessDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Resource Dialog - Moved outside disaster loop for proper rendering */}
      <Dialog open={addResourceOpen} onOpenChange={setAddResourceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Resources</DialogTitle>
            <DialogDescription>
              Add resources to allocate to disasters
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resource-type">Resource Type</Label>
              <Select 
                value={selectedResourceType} 
                onValueChange={setSelectedResourceType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map(type => (
                    <SelectItem 
                      key={type.value} 
                      value={type.value}
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Initial Amount</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                value={resourceAmount}
                onChange={(e) => setResourceAmount(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddResourceOpen(false)
              setSelectedResourceType("")
              setResourceAmount(100)
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddNewResource}
              disabled={isAddingResource}
            >
              {isAddingResource ? "Adding..." : "Add Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 