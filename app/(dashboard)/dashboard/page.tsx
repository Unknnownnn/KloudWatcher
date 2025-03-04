"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
import {
  AlertCircle,
  BarChart3,
  Bell,
  Calendar,
  CloudLightning,
  FileText,
  HelpCircle,
  Home,
  MapPin,
  MessageSquare,
  Package,
  Search,
  Settings,
  Users,
} from "lucide-react"
import { resourceTypes } from "@/lib/utils"
import DashboardMap from "@/components/dashboard-map"
import DisasterList from "@/components/disaster-list"
import ResourceAllocation from "@/components/resource-allocation"
import RecentActivity from "@/components/recent-activity"
import DisasterStats from "@/components/disaster-stats"
import { toast } from "sonner"
import Link from "next/link"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedResources, setSelectedResources] = useState<{ [key: string]: string[] }>({})
  const [isResponding, setIsResponding] = useState(false)
  const [responseStatus, setResponseStatus] = useState<{ [key: string]: 'pending' | 'success' | 'error' | null }>({})

  // Mock data for teams
  const teams = [
    { id: 1, name: "Alpha Response Unit", members: 12, status: "Active", location: "Kerala" },
    { id: 2, name: "Bravo Rescue Squad", members: 8, status: "Active", location: "West Bengal" },
    { id: 3, name: "Charlie Medical Team", members: 15, status: "Standby", location: "Uttarakhand" },
    { id: 4, name: "Delta Logistics Unit", members: 10, status: "Active", location: "Mumbai" },
    { id: 5, name: "Echo Support Team", members: 6, status: "Standby", location: "Delhi" },
  ]

  // Mock data for calendar events
  const calendarEvents = [
    { id: 1, title: "Kerala Flood Response", date: new Date("2023-06-15"), type: "Response" },
    { id: 2, title: "Cyclone Amphan Assessment", date: new Date("2023-05-25"), type: "Assessment" },
    { id: 3, title: "Uttarakhand Relief Distribution", date: new Date("2023-07-10"), type: "Relief" },
    { id: 4, title: "Team Training Session", date: new Date("2023-07-20"), type: "Training" },
    { id: 5, title: "Resource Allocation Meeting", date: new Date("2023-07-25"), type: "Meeting" },
  ]

  const handleResourceSelect = (disasterId: string, resource: string) => {
    setSelectedResources(prev => ({
      ...prev,
      [disasterId]: prev[disasterId]
        ? prev[disasterId].includes(resource)
          ? prev[disasterId].filter(r => r !== resource)
          : [...prev[disasterId], resource]
        : [resource]
    }))
  }

  const handleRespond = async (disasterId: string) => {
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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <CloudLightning className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">KloudWatcher</span>
          </Link>
          <div className="flex items-center gap-4 md:gap-6">
            <form className="hidden md:flex">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search..." className="w-64 pl-8" />
              </div>
            </form>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                3
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
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
        </div>
      </header>
      <div className="grid flex-1 md:grid-cols-[240px_1fr]">
        <aside className="hidden border-r md:block">
          <div className="flex h-full flex-col gap-2 p-4">
            <Button variant="ghost" className="justify-start gap-2" onClick={() => setActiveTab("overview")}>
              <Home className="h-5 w-5" />
              Overview
            </Button>
            <Button variant="ghost" className="justify-start gap-2" onClick={() => setActiveTab("disasters")}>
              <AlertCircle className="h-5 w-5" />
              Disasters
            </Button>
            <Button variant="ghost" className="justify-start gap-2" onClick={() => setActiveTab("resources")}>
              <Package className="h-5 w-5" />
              Resources
            </Button>
            <Button variant="ghost" className="justify-start gap-2" onClick={() => setActiveTab("map")}>
              <MapPin className="h-5 w-5" />
              Map
            </Button>
            <Button variant="ghost" className="justify-start gap-2" onClick={() => setActiveTab("analytics")}>
              <BarChart3 className="h-5 w-5" />
              Analytics
            </Button>
            <Button variant="ghost" className="justify-start gap-2" onClick={() => setActiveTab("calendar")}>
              <Calendar className="h-5 w-5" />
              Calendar
            </Button>
            <Button variant="ghost" className="justify-start gap-2" onClick={() => setActiveTab("teams")}>
              <Users className="h-5 w-5" />
              Teams
            </Button>
            <Button variant="ghost" className="justify-start gap-2 mt-auto" onClick={() => setActiveTab("help")}>
              <HelpCircle className="h-5 w-5" />
              Help & Support
            </Button>
          </div>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <Badge variant="outline" className="ml-2">
              Admin
            </Badge>
          </div>

          <Tabs defaultValue="overview" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="disasters">Disasters</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Active Disasters</AlertTitle>
                <AlertDescription>There are currently 3 active disasters being monitored.</AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Disasters</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">+1 from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resources Deployed</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,284</div>
                    <p className="text-xs text-muted-foreground">+346 from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">People Affected</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24,589</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Response Teams</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">42</div>
                    <p className="text-xs text-muted-foreground">+8 from last month</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Disaster Map</CardTitle>
                    <CardDescription>Real-time visualization of active disasters</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px] p-0">
                    <DashboardMap />
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates from the field</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentActivity />
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Active Disasters</CardTitle>
                    <CardDescription>Currently monitored disaster events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DisasterList />
                  </CardContent>
                </Card>
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Resource Allocation</CardTitle>
                    <CardDescription>Distribution of resources across active disasters</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResourceAllocation />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="disasters" className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-xl font-bold">Disaster Management</h2>
                <Button>Add New Disaster</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Kerala Floods</CardTitle>
                      <Badge>Critical</Badge>
                    </div>
                    <CardDescription>Started: 12 Jun 2023</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span>Flood</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Location:</span>
                        <span>Kerala, India</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Affected:</span>
                        <span>12,450 people</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-red-500 font-medium">Active</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Details
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            variant={responseStatus["1"] === 'success' ? "outline" : "default"}
                          >
                            {responseStatus["1"] === 'success' ? 'Update Response' : 'Respond'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Respond to Kerala Floods</DialogTitle>
                            <DialogDescription>
                              Select resources to deploy for this disaster response
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            {["food", "water", "medical supplies", "shelter", "rescue equipment"].map((resource) => (
                              <div key={resource} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`1-${resource}`}
                                  checked={selectedResources["1"]?.includes(resource)}
                                  onCheckedChange={() => handleResourceSelect("1", resource)}
                                />
                                <label
                                  htmlFor={`1-${resource}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {resource.charAt(0).toUpperCase() + resource.slice(1)}
                                </label>
                              </div>
                            ))}
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => handleRespond("1")}
                              disabled={isResponding || !selectedResources["1"]?.length}
                            >
                              {isResponding ? "Responding..." : "Confirm Response"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Cyclone Amphan</CardTitle>
                      <Badge>High</Badge>
                    </div>
                    <CardDescription>Started: 20 May 2023</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span>Cyclone</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Location:</span>
                        <span>West Bengal, India</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Affected:</span>
                        <span>8,750 people</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-red-500 font-medium">Active</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        Respond
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Uttarakhand Landslide</CardTitle>
                      <Badge>Medium</Badge>
                    </div>
                    <CardDescription>Started: 5 Jul 2023</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span>Landslide</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Location:</span>
                        <span>Uttarakhand, India</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Affected:</span>
                        <span>3,389 people</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-red-500 font-medium">Active</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        Respond
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Disaster Statistics</CardTitle>
                  <CardDescription>Historical data and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <DisasterStats />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-xl font-bold">Resource Management</h2>
                <Button>Add Resources</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {resourceTypes.slice(0, 4).map((resource) => (
                  <Card key={resource.value}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{resource.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{Math.floor(Math.random() * 1000) + 100}</div>
                      <div className="text-xs text-muted-foreground">Available units</div>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          Manage
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Allocation</CardTitle>
                  <CardDescription>Current distribution of resources</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResourceAllocation />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Requests</CardTitle>
                  <CardDescription>Pending requests from disaster areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="font-medium">Kerala Floods</div>
                        <div className="text-sm text-muted-foreground">Food & Water - 500 units</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Reject
                        </Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="font-medium">Cyclone Amphan</div>
                        <div className="text-sm text-muted-foreground">Medical Supplies - 200 units</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Reject
                        </Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Uttarakhand Landslide</div>
                        <div className="text-sm text-muted-foreground">Rescue Equipment - 50 units</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Reject
                        </Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="map" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Disaster Mapping</CardTitle>
                  <CardDescription>Geographic visualization of disaster events</CardDescription>
                </CardHeader>
                <CardContent className="h-[600px] p-0">
                  <DashboardMap />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Disaster Analytics</CardTitle>
                  <CardDescription>Trends and patterns in disaster occurrences</CardDescription>
                </CardHeader>
                <CardContent>
                  <DisasterStats />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-xl font-bold">Disaster Response Calendar</h2>
                <Button>Add Event</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {calendarEvents.map((event) => (
                  <Card key={event.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{event.title}</CardTitle>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                      <CardDescription>
                        {format(event.date, "PPP")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="teams" className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-xl font-bold">Response Teams</h2>
                <Button>Add Team</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                  <Card key={team.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{team.name}</CardTitle>
                        <Badge variant={team.status === "Active" ? "default" : "secondary"}>
                          {team.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {team.members} members • {team.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button size="sm">
                          Contact
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

