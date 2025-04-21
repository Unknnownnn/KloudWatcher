import type React from "react"
import 'leaflet/dist/leaflet.css'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex min-h-screen flex-col">{children}</div>
}

