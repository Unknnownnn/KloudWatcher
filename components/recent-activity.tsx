"use client"

import { useState, useEffect, useCallback } from "react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ActivityItem {
  id: string
  name: string
  disaster_type: string
  created_at: string
  status: string
  priority: string
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchRecentActivity = useCallback(async () => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('predictions')
        .select('id, name, disaster_type, created_at, status, priority')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (error) {
        console.error('Error fetching recent activity:', error)
        return
      }
      
      setActivities(data || [])
    } catch (err) {
      console.error('Error fetching recent activity:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecentActivity()
    
    // Set up real-time subscription for updates
    const subscription = supabase
      .channel('activity-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'predictions' },
        () => {
          fetchRecentActivity()
        }
      )
      .subscribe()
      
    return () => {
      subscription.unsubscribe()
    }
  }, [fetchRecentActivity])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✅"
      case "active":
        return "🔴"
      case "responding":
        return "🚨"
      case "pending":
        return "⏳"
      default:
        return "📋"
    }
  }

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-orange-500"
      case "low":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-4">
        <div className="text-center">
          <div className="mb-2 h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <div className="text-xs text-muted-foreground">Loading activity...</div>
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex justify-center items-center h-full py-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 pb-3 last:pb-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <span role="img" aria-label={activity.status}>
              {getStatusIcon(activity.status)}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{activity.name}</p>
              <div className={`h-2 w-2 rounded-full ${getPriorityIndicator(activity.priority)}`}></div>
            </div>
            <p className="text-xs text-muted-foreground">
              {activity.disaster_type.charAt(0).toUpperCase() + activity.disaster_type.slice(1)} disaster - {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

