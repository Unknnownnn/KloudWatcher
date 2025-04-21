"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import dynamic from 'next/dynamic'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'

// Dynamically import Leaflet components with no SSR
const Map = dynamic(
  () => import('./Map'),
  { ssr: false }
)

export function DisasterMap() {
  return (
    <Card className="w-full h-[600px] overflow-hidden">
      <Map />
    </Card>
  )
} 