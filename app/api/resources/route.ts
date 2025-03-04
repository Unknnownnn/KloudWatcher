import { NextResponse } from "next/server"

// In a real application, this would connect to a database
// For this demo, we'll use mock data

const resources = [
  {
    id: 1,
    type: "food",
    name: "Food & Water",
    available: 850,
    allocated: 750,
    pending: 100,
  },
  {
    id: 2,
    type: "medical",
    name: "Medical Supplies",
    available: 500,
    allocated: 450,
    pending: 50,
  },
  {
    id: 3,
    type: "shelter",
    name: "Shelter",
    available: 350,
    allocated: 300,
    pending: 50,
  },
  {
    id: 4,
    type: "clothing",
    name: "Clothing",
    available: 600,
    allocated: 500,
    pending: 100,
  },
  {
    id: 5,
    type: "rescue",
    name: "Rescue Equipment",
    available: 250,
    allocated: 225,
    pending: 25,
  },
  {
    id: 6,
    type: "volunteers",
    name: "Volunteers",
    available: 300,
    allocated: 250,
    pending: 50,
  },
  {
    id: 7,
    type: "transport",
    name: "Transportation",
    available: 150,
    allocated: 125,
    pending: 25,
  },
  {
    id: 8,
    type: "communication",
    name: "Communication Equipment",
    available: 200,
    allocated: 175,
    pending: 25,
  },
]

export async function GET() {
  return NextResponse.json(resources)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // In a real application, we would validate the data and save it to a database
    // For this demo, we'll just return the data with a mock ID

    const newResource = {
      id: resources.length + 1,
      ...data,
    }

    return NextResponse.json(newResource, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add resource" }, { status: 400 })
  }
}

