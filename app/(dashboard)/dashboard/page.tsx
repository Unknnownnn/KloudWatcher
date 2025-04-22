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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertCircle,
  BarChart3,
  Bell,
  Calendar,
  CloudLightning,
  FileText,
  HelpCircle,
  Home,
  LogOut,
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
import DashboardSummary from "@/components/dashboard-summary"
import { toast } from "sonner"
import Link from "next/link"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import DisasterManagement from "@/components/disaster-management"
import ResourceManagement from "@/components/resource-management"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedResources, setSelectedResources] = useState<{ [key: string]: string[] }>({})
  const [isResponding, setIsResponding] = useState(false)
  const [responseStatus, setResponseStatus] = useState<{ [key: string]: 'pending' | 'success' | 'error' | null }>({})
  const router = useRouter()

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

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Signed out successfully')
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
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
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <Button variant="destructive" className="justify-start gap-2" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
              Sign Out
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
              <DashboardSummary />

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Disaster Map</CardTitle>
                    <CardDescription>Global view of active disasters</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <DashboardMap />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates and alerts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentActivity />
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Active Disasters</CardTitle>
                    <CardDescription>Currently monitored events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DisasterList />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="disasters" className="space-y-4">
              <DisasterManagement />
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <ResourceManagement />
            </TabsContent>

            <TabsContent value="map" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Disaster Map</CardTitle>
                  <CardDescription>Global view of active disasters</CardDescription>
                </CardHeader>
                <CardContent className="h-[700px]">
                  <DashboardMap />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Disaster Statistics</CardTitle>
                  <CardDescription>Analysis of disaster trends and impacts</CardDescription>
                </CardHeader>
                <CardContent>
                  <DisasterStats />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Response Calendar</CardTitle>
                  <CardDescription>Scheduled events and activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {calendarEvents.map((event) => (
                      <div key={event.id} className="flex items-center gap-4 rounded-md border p-3">
                        <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                          <CalendarIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{event.title}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Badge variant="outline" className="mr-2">
                              {event.type}
                            </Badge>
                            {format(event.date, "MMM dd, yyyy")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teams" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Response Teams</CardTitle>
                  <CardDescription>Active and standby personnel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teams.map((team) => (
                      <div key={team.id} className="flex items-center gap-4 rounded-md border p-3">
                        <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                          <Users className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{team.name}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Badge variant="outline" className={team.status === "Active" ? "bg-blue-700 text-white hover:bg-blue-800" : "bg-blue-600 text-white hover:bg-blue-700"}>
                              {team.status}
                            </Badge>
                            <span className="ml-2">{team.members} members</span>
                            <span className="ml-2">Location: {team.location}</span>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>{team.name}</DialogTitle>
                              <DialogDescription>
                                Team details and current deployment status
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="text-sm font-medium">Status</h3>
                                  <p className="text-sm text-muted-foreground">{team.status}</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium">Location</h3>
                                  <p className="text-sm text-muted-foreground">{team.location}</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium">Team Size</h3>
                                  <p className="text-sm text-muted-foreground">{team.members} members</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium">Specialization</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {team.name.includes("Medical") 
                                      ? "Medical Response" 
                                      : team.name.includes("Rescue") 
                                        ? "Search & Rescue" 
                                        : team.name.includes("Logistics") 
                                          ? "Resource Management"
                                          : "General Response"}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="border-t pt-4">
                                <h3 className="mb-2 text-sm font-medium">Team Members</h3>
                                <div className="rounded-md border">
                                  {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between border-b p-2 last:border-0">
                                      <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-primary/10"></div>
                                        <span className="text-sm">
                                          {["Team Leader", "Field Specialist", "Support Personnel"][i]}
                                        </span>
                                      </div>
                                      <Badge variant="outline" className="bg-blue-100">
                                        {i === 0 ? "Leader" : i === 1 ? "Specialist" : "Support"}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="rounded-md border bg-muted/50 p-3">
                                <h3 className="mb-2 text-sm font-medium">Current Assignment</h3>
                                <p className="text-sm text-muted-foreground">
                                  {team.status === "Active" 
                                    ? `Responding to disaster situation in ${team.location}`
                                    : "On standby, ready for deployment"}
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline">Contact Team</Button>
                              <Button type="button">View Full Details</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

