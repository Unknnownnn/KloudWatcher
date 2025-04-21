"use client"

import { DisasterMap } from "@/components/DisasterMap"

export default function DisasterMapPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Disaster Map</h2>
      </div>
      <div className="grid gap-4">
        <DisasterMap />
      </div>
    </div>
  )
} 