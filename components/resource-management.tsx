"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BadgePlus, Plus, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { resourceTypes } from "@/lib/utils"
import { createClient } from '@supabase/supabase-js'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Initialize Supabase client
let supabase: any;
try {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
}

interface Resource {
  id: string
  type: string
  available_units: number
  allocated_units: number
  name: string
}

interface ResourceRequest {
  id: string
  disaster_name: string
  resource_type: string
  requested_units: number
  status: 'pending' | 'approved' | 'rejected'
  disaster_id: string
}

// Default resources to use if Supabase is unavailable
const defaultResources = resourceTypes.map((type, index) => ({
  id: `local-${index}`,
  type: type.value,
  name: type.label,
  available_units: Math.floor(Math.random() * 1000) + 100,
  allocated_units: Math.floor(Math.random() * 100),
}));

export default function ResourceManagement() {
  const [resources, setResources] = useState<Resource[]>([])
  const [requests, setRequests] = useState<ResourceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUsingLocalData, setIsUsingLocalData] = useState(false)
  
  // New state for the add resource form
  const [selectedResourceType, setSelectedResourceType] = useState("")
  const [resourceAmount, setResourceAmount] = useState<number>(100)
  const [resourceToUpdate, setResourceToUpdate] = useState<Resource | null>(null)
  const [addResourceOpen, setAddResourceOpen] = useState(false)
  
  // New state for success confirmation
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [successAction, setSuccessAction] = useState<'add' | 'update' | null>(null)
  const [successResourceName, setSuccessResourceName] = useState("")
  const [successAmount, setSuccessAmount] = useState(0)

  // Generate a unique ID for local resources
  const generateLocalId = () => `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Fetch resources from Supabase or use local data
  const fetchResources = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Try to get resources from Supabase
      if (supabase) {
        try {
          const { data: resourceData, error: resourceError } = await supabase
            .from('resources')
            .select('*')
            .order('type')
          
          if (resourceError) {
            throw resourceError
          }
          
          // If no resources exist in the table yet, create default entries
          if (!resourceData || resourceData.length === 0) {
            // Try to create default resources in Supabase
            try {
              for (const resource of defaultResources) {
                await supabase.from('resources').insert({
                  type: resource.type,
                  name: resource.name,
                  available_units: resource.available_units,
                  allocated_units: resource.allocated_units
                })
              }
              
              // Fetch again after creating defaults
              const { data: newData } = await supabase
                .from('resources')
                .select('*')
                .order('type')
                
              if (newData && newData.length > 0) {
                setResources(newData)
                setIsUsingLocalData(false)
                return
              }
            } catch (insertError) {
              console.error('Error creating default resources:', insertError)
              // Fall back to local data
              setResources(defaultResources)
              setIsUsingLocalData(true)
              return
            }
          }
          
          setResources(resourceData || defaultResources)
          setIsUsingLocalData(false)
          
          // Try to get resource requests
          try {
            const { data: requestData, error: requestError } = await supabase
              .from('resource_requests')
              .select('*, predictions(name)')
              .eq('status', 'pending')
            
            if (requestError) throw requestError
            
            // Transform request data
            const transformedRequests = requestData.map((item: any) => ({
              id: item.id,
              disaster_name: item.predictions?.name || 'Unknown disaster',
              resource_type: item.resource_type,
              requested_units: item.requested_units,
              status: item.status,
              disaster_id: item.disaster_id
            }))
            
            setRequests(transformedRequests)
          } catch (requestError) {
            console.error('Error fetching resource requests:', requestError)
            setRequests([])
          }
        } catch (error) {
          console.error('Error fetching resources from Supabase:', error)
          // Fall back to local data
          setResources(defaultResources)
          setIsUsingLocalData(true)
          setRequests([])
        }
      } else {
        // Supabase not initialized, use local data
        setResources(defaultResources)
        setIsUsingLocalData(true)
        setRequests([])
      }
    } catch (err) {
      console.error('Error:', err)
      toast.error('Failed to load data, using local resources instead')
      // Fall back to local data
      setResources(defaultResources)
      setIsUsingLocalData(true)
      setRequests([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResources()
    
    // Only set up Supabase subscriptions if it's available
    if (supabase) {
      try {
        const resourceSubscription = supabase
          .channel('resources-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'resources' },
            (payload: any) => {
              console.log('Resource update received:', payload)
              fetchResources()
            }
          )
          .subscribe()
          
        const requestSubscription = supabase
          .channel('resource-requests-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'resource_requests' },
            (payload: any) => {
              console.log('Resource request update received:', payload)
              fetchResources()
            }
          )
          .subscribe()
          
        return () => {
          resourceSubscription.unsubscribe()
          requestSubscription.unsubscribe()
        }
      } catch (error) {
        console.error('Error setting up Supabase subscriptions:', error)
      }
    }
  }, [fetchResources])

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    setIsProcessing(true)
    
    try {
      const request = requests.find(r => r.id === requestId)
      if (!request) {
        throw new Error('Request not found')
      }
      
      if (isUsingLocalData) {
        // Handle locally
        const updatedRequests = requests.filter(r => r.id !== requestId)
        setRequests(updatedRequests)
        
        if (action === 'approve') {
          // Update local resource allocation
          const resource = resources.find(r => r.type === request.resource_type)
          if (resource) {
            if (resource.available_units < request.requested_units) {
              toast.error('Not enough resources available')
              setIsProcessing(false)
              return
            }
            
            const updatedResources = resources.map(r => 
              r.id === resource.id 
                ? {
                    ...r, 
                    available_units: r.available_units - request.requested_units,
                    allocated_units: r.allocated_units + request.requested_units
                  }
                : r
            )
            setResources(updatedResources)
          }
        }
        
        toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
      } else if (supabase) {
        // Handle with Supabase
        // Get the request details first
        const { data: requestData } = await supabase
          .from('resource_requests')
          .select('*')
          .eq('id', requestId)
          .single()
        
        if (!requestData) {
          throw new Error('Request not found')
        }
        
        // Update request status
        const { error: updateError } = await supabase
          .from('resource_requests')
          .update({ status: action === 'approve' ? 'approved' : 'rejected' })
          .eq('id', requestId)
        
        if (updateError) {
          throw new Error(updateError.message)
        }
        
        // If approved, update resource allocation
        if (action === 'approve') {
          // Get the resource
          const { data: resourceData } = await supabase
            .from('resources')
            .select('*')
            .eq('type', requestData.resource_type)
            .single()
          
          if (!resourceData) {
            throw new Error('Resource not found')
          }
          
          // Check if enough resources available
          if (resourceData.available_units < requestData.requested_units) {
            toast.error('Not enough resources available')
            setIsProcessing(false)
            return
          }
          
          // Update resource allocation
          const { error: resourceError } = await supabase
            .from('resources')
            .update({
              available_units: resourceData.available_units - requestData.requested_units,
              allocated_units: resourceData.allocated_units + requestData.requested_units
            })
            .eq('id', resourceData.id)
          
          if (resourceError) {
            throw new Error(resourceError.message)
          }
        }
        
        toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
      } else {
        throw new Error('Supabase is not available and local mode failed')
      }
      
      // Refresh data
      fetchResources()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process request')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddNewResource = async () => {
    setIsProcessing(true)
    
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
        if (isUsingLocalData || !supabase) {
          // Update in local state
          const updatedResources = resources.map(r =>
            r.id === existingResource.id
              ? { ...r, available_units: r.available_units + resourceAmount }
              : r
          )
          setResources(updatedResources)
          toast.success(`Added ${resourceAmount} units to ${resourceType.label}`)
        } else {
          // Update in Supabase
          try {
            const { error } = await supabase
              .from('resources')
              .update({
                available_units: existingResource.available_units + resourceAmount
              })
              .eq('id', existingResource.id)
              
            if (error) throw error
            
            // Setup success dialog
            setSuccessAction('update')
            setSuccessResourceName(resourceType.label)
            setSuccessAmount(resourceAmount)
            setSuccessDialogOpen(true)
            
          } catch (error) {
            console.error('Supabase update failed, updating locally:', error)
            // Fall back to local update
            const updatedResources = resources.map(r =>
              r.id === existingResource.id
                ? { ...r, available_units: r.available_units + resourceAmount }
                : r
            )
            setResources(updatedResources)
            setIsUsingLocalData(true)
            
            // Setup success dialog
            setSuccessAction('update')
            setSuccessResourceName(resourceType.label)
            setSuccessAmount(resourceAmount)
            setSuccessDialogOpen(true)
          }
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
          
          // Setup success dialog
          setSuccessAction('add')
          setSuccessResourceName(resourceType.label)
          setSuccessAmount(resourceAmount)
          setSuccessDialogOpen(true)
        } catch (error) {
          console.error('Supabase insert failed, adding locally:', error)
          // Fall back to local insert
          const newResource = {
            id: generateLocalId(),
            type: selectedResourceType,
            name: resourceType.label,
            available_units: resourceAmount,
            allocated_units: 0
          }
          setResources(prev => [...prev, newResource])
          setIsUsingLocalData(true)
          
          // Setup success dialog
          setSuccessAction('add')
          setSuccessResourceName(resourceType.label)
          setSuccessAmount(resourceAmount)
          setSuccessDialogOpen(true)
        }
      }
      
      // Reset form and close dialog
      setSelectedResourceType("")
      setResourceAmount(100)
      setAddResourceOpen(false)
      
      // Refresh data (only if using Supabase)
      if (!isUsingLocalData && supabase) {
        fetchResources()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add resource')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateResource = async () => {
    setIsProcessing(true)
    
    try {
      if (!resourceToUpdate) {
        toast.error('No resource selected')
        return
      }
      
      if (resourceAmount <= 0) {
        toast.error('Please enter a valid amount')
        return
      }
      
      if (isUsingLocalData || !supabase) {
        // Update in local state
        const updatedResources = resources.map(r =>
          r.id === resourceToUpdate.id
            ? { ...r, available_units: r.available_units + resourceAmount }
            : r
        )
        setResources(updatedResources)
        
        // Setup success dialog
        setSuccessAction('update')
        setSuccessResourceName(resourceToUpdate.name)
        setSuccessAmount(resourceAmount)
        setSuccessDialogOpen(true)
      } else {
        // Update in Supabase
        try {
          const { error } = await supabase
            .from('resources')
            .update({
              available_units: resourceToUpdate.available_units + resourceAmount
            })
            .eq('id', resourceToUpdate.id)
            
          if (error) throw error
          
          // Setup success dialog
          setSuccessAction('update')
          setSuccessResourceName(resourceToUpdate.name)
          setSuccessAmount(resourceAmount)
          setSuccessDialogOpen(true)
        } catch (error) {
          console.error('Supabase update failed, updating locally:', error)
          // Fall back to local update
          const updatedResources = resources.map(r =>
            r.id === resourceToUpdate.id
              ? { ...r, available_units: r.available_units + resourceAmount }
              : r
          )
          setResources(updatedResources)
          setIsUsingLocalData(true)
          
          // Setup success dialog
          setSuccessAction('update')
          setSuccessResourceName(resourceToUpdate.name)
          setSuccessAmount(resourceAmount)
          setSuccessDialogOpen(true)
        }
      }
      
      // Reset form and close dialog
      setResourceToUpdate(null)
      setResourceAmount(100)
      setAddResourceOpen(false)
      
      // Refresh data (only if using Supabase)
      if (!isUsingLocalData && supabase) {
        fetchResources()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update resource')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleManageResource = (resource: Resource) => {
    setResourceToUpdate(resource)
    setResourceAmount(100)
    setAddResourceOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <div className="text-sm text-muted-foreground">Loading resource data...</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Resource Management</h2>
        </div>
        <Dialog open={addResourceOpen} onOpenChange={setAddResourceOpen}>
          <DialogTrigger asChild>
            <Button>
              <BadgePlus className="mr-2 h-4 w-4" />
              Add Resources
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resource Management</DialogTitle>
              <DialogDescription>
                Add new resources or replenish existing ones
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue={resourceToUpdate ? "replenish" : "new"}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new" disabled={!!resourceToUpdate}>New Resource</TabsTrigger>
                <TabsTrigger value="replenish">Replenish Existing</TabsTrigger>
              </TabsList>
              
              <TabsContent value="new" className="space-y-4 py-4">
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
                          disabled={resources.some(r => r.type === type.value)}
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
              </TabsContent>
              
              <TabsContent value="replenish" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="resource">Resource</Label>
                  <Select 
                    value={resourceToUpdate?.id || ''} 
                    onValueChange={(value) => {
                      const resource = resources.find(r => r.id === value)
                      setResourceToUpdate(resource || null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select resource to replenish" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map(resource => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name} ({resource.available_units} available)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to Add</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={1}
                    value={resourceAmount}
                    onChange={(e) => setResourceAmount(parseInt(e.target.value) || 0)}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setAddResourceOpen(false)
                setResourceToUpdate(null)
                setSelectedResourceType("")
                setResourceAmount(100)
              }}>
                Cancel
              </Button>
              <Button 
                onClick={resourceToUpdate ? handleUpdateResource : handleAddNewResource}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : resourceToUpdate ? "Replenish Resource" : "Add Resource"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
        {resources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{resource.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resource.available_units}</div>
              <div className="text-xs text-muted-foreground">Available units</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {resource.allocated_units} allocated
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleManageResource(resource)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Replenish
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {resourceTypes.some(type => !resources.find(r => r.type === type.value)) && (
          <Card className="flex flex-col items-center justify-center border-dashed">
            <CardContent className="pt-6 text-center">
              <Button 
                variant="ghost" 
                className="h-20 w-full rounded-md border border-dashed"
                onClick={() => {
                  setResourceToUpdate(null)
                  setAddResourceOpen(true)
                }}
              >
                <div className="flex flex-col items-center justify-center">
                  <Plus className="h-6 w-6 mb-2 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Add New Resource Type</span>
                </div>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Resource Requests</CardTitle>
          <CardDescription>Pending requests from disaster areas</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <div className="font-medium">{request.disaster_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {resourceTypes.find(r => r.value === request.resource_type)?.label || request.resource_type} - {request.requested_units} units
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequestAction(request.id, 'reject')}
                      disabled={isProcessing}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRequestAction(request.id, 'approve')}
                      disabled={isProcessing}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No pending resource requests</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Resource Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {successAction === 'add' ? 'Resource Added Successfully' : 'Resource Updated Successfully'}
            </DialogTitle>
            <DialogDescription>
              {successAction === 'add'
                ? `${successResourceName} has been added to your inventory.`
                : `${successResourceName} inventory has been updated.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              <Alert className="bg-green-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-green-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  {successAction === 'add'
                    ? `${successAmount} units of ${successResourceName} have been added to your resource inventory.`
                    : `${successAmount} additional units of ${successResourceName} have been added to your resource inventory.`}
                </AlertDescription>
              </Alert>
              <div className="text-sm text-center mt-4">
                You can now allocate these resources to disaster response efforts.
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button 
              onClick={() => {
                setSuccessDialogOpen(false);
                setAddResourceOpen(false);
                setResourceToUpdate(null);
                setSelectedResourceType("");
                setResourceAmount(100);
              }}
              className="w-full sm:w-auto"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 