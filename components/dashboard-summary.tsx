"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from '@supabase/supabase-js'
import { 
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  Clock
} from "lucide-react"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DashboardSummary() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    responding: 0,
    highPriority: 0,
    peopleAtRisk: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
      
      if (error) {
        console.error('Error fetching stats:', error)
        return
      }
      
      // Calculate statistics
      const total = data?.length || 0
      const active = data?.filter(d => d.status === 'active').length || 0
      const responding = data?.filter(d => d.status === 'responding').length || 0
      const highPriority = data?.filter(d => d.priority === 'high').length || 0
      
      // Calculate total people at risk
      const peopleAtRisk = data?.reduce((sum, disaster) => {
        return sum + (disaster.estimated_people_at_risk || 0)
      }, 0) || 0
      
      setStats({
        total,
        active,
        responding,
        highPriority,
        peopleAtRisk
      })
    } catch (err) {
      console.error('Error calculating stats:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    
    // Set up real-time subscription for updates
    const subscription = supabase
      .channel('summary-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'predictions' },
        () => {
          fetchStats()
        }
      )
      .subscribe()
      
    return () => {
      subscription.unsubscribe()
    }
  }, [fetchStats])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="rounded-lg border bg-card p-6 animate-pulse">
            <div className="h-6 w-3/4 bg-muted rounded mb-4"></div>
            <div className="h-8 w-1/3 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium">High Priority</span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold">{stats.highPriority}</div>
          <p className="text-xs text-muted-foreground">
            {(stats.total > 0) ? Math.round((stats.highPriority / stats.total) * 100) : 0}% of total disasters
          </p>
        </div>
      </div>
      
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Active Disasters</span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold">{stats.active}</div>
          <p className="text-xs text-muted-foreground">
            {(stats.total > 0) ? Math.round((stats.active / stats.total) * 100) : 0}% of total disasters
          </p>
        </div>
      </div>
      
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium">Response Ongoing</span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold">{stats.responding}</div>
          <p className="text-xs text-muted-foreground">
            {(stats.total > 0) ? Math.round((stats.responding / stats.total) * 100) : 0}% of total disasters
          </p>
        </div>
      </div>
      
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">People At Risk</span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold">{stats.peopleAtRisk.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Across {stats.total} disaster areas
          </p>
        </div>
      </div>
    </div>
  )
} 