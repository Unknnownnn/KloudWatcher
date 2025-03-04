import { NextResponse } from "next/server"

// In a real application, this would connect to a database
// For this demo, we'll use mock data

const disasters = [
  {
    id: 1,
    name: "Kerala Floods",
    type: "flood",
    location: "Kerala, India",
    coordinates: [76.2711, 10.8505],
    severity: "critical",
    startDate: "2023-06-12T00:00:00Z",
    status: "active",
    affectedCount: 12450,
    description: "Severe flooding in Kerala due to heavy monsoon rains.",
    resources: {
      food: 350,
      medical: 200,
      shelter: 150,
      rescue: 100,
      other: 50,
    },
  },
  {
    id: 2,
    name: "Cyclone Amphan",
    type: "cyclone",
    location: "West Bengal, India",
    coordinates: [88.3639, 22.5726],
    severity: "high",
    startDate: "2023-05-20T00:00:00Z",
    status: "active",
    affectedCount: 8750,
    description: "Powerful tropical cyclone affecting West Bengal and Odisha.",
    resources: {
      food: 250,
      medical: 150,
      shelter: 100,
      rescue: 75,
      other: 25,
    },
  },
  {
    id: 3,
    name: "Uttarakhand Landslide",
    type: "landslide",
    location: "Uttarakhand, India",
    coordinates: [79.0193, 30.0668],
    severity: "medium",
    startDate: "2023-07-05T00:00:00Z",
    status: "active",
    affectedCount: 3389,
    description: "Landslides in Uttarakhand caused by heavy rainfall.",
    resources: {
      food: 150,
      medical: 100,
      shelter: 50,
      rescue: 50,
      other: 10,
    },
  },
]

export async function GET() {
  return NextResponse.json(disasters)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // In a real application, we would validate the data and save it to a database
    // For this demo, we'll just return the data with a mock ID

    const newDisaster = {
      id: disasters.length + 1,
      ...data,
      status: "active",
      startDate: new Date().toISOString(),
    }

    return NextResponse.json(newDisaster, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create disaster" }, { status: 400 })
  }
}

