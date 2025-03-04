import { AlertCircle, MessageSquare, Package, Users } from "lucide-react"

export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "resource",
      message: "200 food packages deployed to Kerala Floods",
      timestamp: new Date("2023-07-15T10:30:00"),
      icon: Package,
    },
    {
      id: 2,
      type: "team",
      message: "Rescue team Alpha deployed to Uttarakhand",
      timestamp: new Date("2023-07-15T09:45:00"),
      icon: Users,
    },
    {
      id: 3,
      type: "alert",
      message: "Cyclone Amphan intensity increased to Category 4",
      timestamp: new Date("2023-07-15T08:20:00"),
      icon: AlertCircle,
    },
    {
      id: 4,
      type: "communication",
      message: "Emergency broadcast sent to West Bengal residents",
      timestamp: new Date("2023-07-15T07:15:00"),
      icon: MessageSquare,
    },
    {
      id: 5,
      type: "resource",
      message: "Medical supplies (150 units) sent to Kerala",
      timestamp: new Date("2023-07-15T06:30:00"),
      icon: Package,
    },
  ]

  const getIconColor = (type: string) => {
    switch (type) {
      case "resource":
        return "text-blue-500"
      case "team":
        return "text-green-500"
      case "alert":
        return "text-red-500"
      case "communication":
        return "text-purple-500"
      default:
        return "text-gray-500"
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
          <div className={`mt-0.5 rounded-full p-1.5 ${getIconColor(activity.type)} bg-opacity-10`}>
            <activity.icon className={`h-4 w-4 ${getIconColor(activity.type)}`} />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm">{activity.message}</p>
            <p className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

