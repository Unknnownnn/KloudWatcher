"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface DisasterCount {
  month: string;
  count: number;
}

interface DisasterTypeCount {
  type: string;
  count: number;
  color: string;
}

export default function DisasterStats() {
  const chartRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<DisasterCount[]>([])
  const [disasterTypeData, setDisasterTypeData] = useState<DisasterTypeCount[]>([])
  const [totalDisasters, setTotalDisasters] = useState(0)

  const typeColors: Record<string, string> = {
    'flood': 'bg-blue-500',
    'cyclone': 'bg-teal-500',
    'earthquake': 'bg-red-500',
    'landslide': 'bg-yellow-500',
    'drought': 'bg-orange-500',
    'wildfire': 'bg-violet-500',
    'tsunami': 'bg-cyan-500',
    'tornado': 'bg-purple-500',
    'volcanic_eruption': 'bg-rose-500',
    'testing flood': 'bg-blue-500',
    'testing cyclone': 'bg-teal-500'
  }

  const fetchDisasterStats = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch all disasters
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
      
      if (error) {
        console.error('Error fetching disaster stats:', error)
        return
      }
      
      if (!data || data.length === 0) {
        setMonthlyData([])
        setDisasterTypeData([])
        setTotalDisasters(0)
        return
      }
      
      setTotalDisasters(data.length)
      
      // Process monthly data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthlyCounts = new Array(12).fill(0)
      
      data.forEach(disaster => {
        if (disaster.created_at) {
          const date = new Date(disaster.created_at)
          const month = date.getMonth()
          monthlyCounts[month]++
        }
      })
      
      const formattedMonthlyData = months.map((month, index) => ({
        month,
        count: monthlyCounts[index]
      }))
      
      setMonthlyData(formattedMonthlyData)
      
      // Process disaster type data
      const typeCounts: Record<string, number> = {}
      
      data.forEach(disaster => {
        const type = disaster.disaster_type
        typeCounts[type] = (typeCounts[type] || 0) + 1
      })
      
      const formattedTypeData = Object.entries(typeCounts)
        .map(([type, count]) => ({
          type: type.charAt(0).toUpperCase() + type.slice(1),
          count,
          color: typeColors[type] || 'bg-gray-500'
        }))
        .sort((a, b) => b.count - a.count)
        
      setDisasterTypeData(formattedTypeData)
    } catch (err) {
      console.error('Error processing disaster stats:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchDisasterStats()
    
    // Set up real-time subscription for updates
    const subscription = supabase
      .channel('stats-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'predictions' },
        () => {
          fetchDisasterStats()
        }
      )
      .subscribe()
      
    return () => {
      subscription.unsubscribe()
    }
  }, [fetchDisasterStats])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <div className="text-sm text-muted-foreground">Loading statistics...</div>
        </div>
      </div>
    )
  }

  // Calculate max count for the chart scaling
  const maxCount = Math.max(...monthlyData.map((d) => d.count), 1)

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-medium mb-4">Monthly Disaster Occurrences</h4>
        <div className="h-40 flex items-end justify-between gap-1">
          {monthlyData.map((data) => (
            <div key={data.month} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-primary rounded-t-sm"
                style={{ height: `${(data.count / maxCount) * 100}%` }}
              ></div>
              <div className="text-xs mt-1">{data.month}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-4">Disaster Types Distribution</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {disasterTypeData.map((data) => (
              <div key={data.type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${data.color}`}></div>
                <div className="text-sm flex-1">{data.type}</div>
                <div className="text-sm font-medium">{data.count}</div>
                <div className="text-xs text-muted-foreground">{Math.round((data.count / totalDisasters) * 100)}%</div>
              </div>
            ))}
          </div>
          <div className="relative h-40">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-32 h-32">
                {disasterTypeData.map((data, index) => {
                  const percentage = data.count / totalDisasters
                  const rotation =
                    index === 0
                      ? 0
                      : disasterTypeData
                          .slice(0, index)
                          .reduce((sum, item) => sum + (item.count / totalDisasters) * 360, 0)

                  return (
                    <div
                      key={data.type}
                      className={`absolute inset-0 ${data.color}`}
                      style={{
                        clipPath: `conic-gradient(from ${rotation}deg, currentColor ${percentage * 360}deg, transparent 0)`,
                      }}
                    ></div>
                  )
                })}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-background rounded-full w-16 h-16 flex items-center justify-center text-sm font-medium">
                    {totalDisasters}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

