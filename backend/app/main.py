from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import folium
import json
from geopy.geocoders import Nominatim

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DisasterLocation(BaseModel):
    name: str
    type: str
    location: str
    severity: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class DisasterResponse(BaseModel):
    resources: List[str]

class ResourceUpdate(BaseModel):
    resources: Dict[str, int]

# Sample disaster data
disasters = [
    {
        "id": 1,
        "name": "Kerala Floods",
        "type": "flood",
        "location": "Kerala, India",
        "status": "active",
        "resources_needed": ["food", "water", "medical supplies"],
        "priority": "high",
        "coordinates": [10.8505, 76.2711],
        "allocated_resources": {
            "food": 350,
            "medical": 200,
            "shelter": 150,
            "rescue": 100,
            "other": 50
        }
    },
    {
        "id": 2,
        "name": "Cyclone Amphan",
        "type": "cyclone",
        "location": "West Bengal, India",
        "status": "active",
        "resources_needed": ["shelter", "medical supplies"],
        "priority": "medium",
        "coordinates": [22.9868, 87.8550],
        "allocated_resources": {
            "food": 250,
            "medical": 150,
            "shelter": 100,
            "rescue": 75,
            "other": 25
        }
    },
    {
        "id": 3,
        "name": "Uttarakhand Landslide",
        "type": "landslide",
        "location": "Uttarakhand, India",
        "status": "active",
        "resources_needed": ["rescue equipment", "medical supplies"],
        "priority": "high",
        "coordinates": [30.0668, 79.0193],
        "allocated_resources": {
            "food": 150,
            "medical": 100,
            "shelter": 50,
            "rescue": 50,
            "other": 10
        }
    }
]

@app.get("/api/map")
async def get_map():
    """Generate a map with disaster locations"""
    # Create a map centered on India
    m = folium.Map(location=[20.5937, 78.9629], zoom_start=5)
    
    # Add markers for each disaster
    for disaster in disasters:
        color = "red" if disaster["priority"] == "high" else "orange" if disaster["priority"] == "medium" else "yellow"
        folium.Marker(
            disaster["coordinates"],
            popup=f"{disaster['name']}<br>Type: {disaster['type']}<br>Priority: {disaster['priority']}",
            icon=folium.Icon(color=color)
        ).add_to(m)
    
    # Save the map as HTML
    map_html = m._repr_html_()
    return {"map_html": map_html}

@app.post("/api/disasters/{disaster_id}/respond")
async def respond_to_disaster(disaster_id: int, response: DisasterResponse):
    """Handle disaster response with resource allocation"""
    disaster = next((d for d in disasters if d["id"] == disaster_id), None)
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster not found")
    
    # Validate resources
    invalid_resources = [r for r in response.resources if r not in disaster["resources_needed"]]
    if invalid_resources:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid resources provided: {', '.join(invalid_resources)}"
        )
    
    # In a real application, this would update a database
    # Here we'll just return a success message with the allocated resources
    return {
        "message": f"Response initiated for {disaster['name']}",
        "resources_allocated": response.resources,
        "status": "success"
    }

@app.post("/api/disasters/{disaster_id}/resources")
async def update_disaster_resources(disaster_id: int, update: ResourceUpdate):
    """Update resource allocation for a disaster"""
    disaster = next((d for d in disasters if d["id"] == disaster_id), None)
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster not found")
    
    # Update the allocated resources
    # In a real application, this would update a database
    disaster["allocated_resources"].update(update.resources)
    
    return {
        "message": f"Resources updated for {disaster['name']}",
        "updated_resources": disaster["allocated_resources"],
        "status": "success"
    }

@app.get("/api/disasters/{disaster_id}/resources")
async def get_disaster_resources(disaster_id: int):
    """Get resources for a specific disaster"""
    disaster = next((d for d in disasters if d["id"] == disaster_id), None)
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster not found")
    
    return {
        "disaster_name": disaster["name"],
        "resources_needed": disaster["resources_needed"],
        "allocated_resources": disaster["allocated_resources"],
        "priority": disaster["priority"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 