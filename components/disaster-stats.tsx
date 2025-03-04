"use client"

import { useRef } from "react"

export default function DisasterStats() {
  const chartRef = useRef<HTMLDivElement>(null)

  // In a real application, we would use a charting library like Chart.js or D3.js
  // For this demo, we'll create a simplified chart visualization

  const monthlyData = [
    { month: "Jan", count: 2 },
    { month: "Feb", count: 1 },
    { month: "Mar", count: 3 },
    { month: "Apr", count: 5 },
    { month: "May", count: 7 },
    { month: "Jun", count: 8 },
    { month: "Jul", count: 6 },
    { month: "Aug", count: 4 },
    { month: "Sep", count: 3 },
    { month: "Oct", count: 2 },
    { month: "Nov", count: 1 },
    { month: "Dec", count: 2 },
  ]

  const disasterTypeData = [
    { type: "Flood", count: 12, color: "bg-blue-500" },
    { type: "Cyclone", count: 8, color: "bg-teal-500" },
    { type: "Earthquake", count: 5, color: "bg-red-500" },
    { type: "Landslide", count: 7, color: "bg-yellow-500" },
    { type: "Drought", count: 3, color: "bg-orange-500" },
    { type: "Other", count: 2, color: "bg-purple-500" },
  ]

  const maxCount = Math.max(...monthlyData.map((d) => d.count))
  const totalDisasters = disasterTypeData.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-medium mb-4">Monthly Disaster Occurrences (2023)</h4>
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

