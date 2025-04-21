import { db } from '../lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

const predictions = [
  {
    disaster_type: 'flood',
    location: 'Mumbai, India',
    prediction: 'Severe flooding expected in coastal areas',
    affected_areas: ['South Mumbai', 'Suburbs'],
    estimated_people_at_risk: 50000,
    recommended_actions: ['Evacuation', 'Emergency supplies'],
    confidence_score: 85,
    data_sources: ['Weather data', 'Historical records'],
    status: 'completed',
    latitude: 19.0760,
    longitude: 72.8777,
    created_at: new Date().toISOString()
  },
  {
    disaster_type: 'cyclone',
    location: 'Chennai, India',
    prediction: 'Category 3 cyclone approaching',
    affected_areas: ['Marina Beach', 'T Nagar'],
    estimated_people_at_risk: 75000,
    recommended_actions: ['Shelter preparation', 'Early warning'],
    confidence_score: 90,
    data_sources: ['Satellite data', 'Weather models'],
    status: 'completed',
    latitude: 13.0827,
    longitude: 80.2707,
    created_at: new Date().toISOString()
  },
  {
    disaster_type: 'earthquake',
    location: 'Delhi, India',
    prediction: 'High seismic activity detected',
    affected_areas: ['Old Delhi', 'New Delhi'],
    estimated_people_at_risk: 100000,
    recommended_actions: ['Building evacuation', 'Emergency response'],
    confidence_score: 75,
    data_sources: ['Seismic sensors', 'Geological data'],
    status: 'completed',
    latitude: 28.6139,
    longitude: 77.2090,
    created_at: new Date().toISOString()
  },
  {
    disaster_type: 'landslide',
    location: 'Shimla, India',
    prediction: 'Risk of landslides due to heavy rainfall',
    affected_areas: ['Mall Road', 'Ridge'],
    estimated_people_at_risk: 25000,
    recommended_actions: ['Area evacuation', 'Road closure'],
    confidence_score: 80,
    data_sources: ['Rainfall data', 'Soil analysis'],
    status: 'completed',
    latitude: 31.1048,
    longitude: 77.1734,
    created_at: new Date().toISOString()
  },
  {
    disaster_type: 'drought',
    location: 'Rajasthan, India',
    prediction: 'Severe drought conditions expected',
    affected_areas: ['Jaipur', 'Jodhpur'],
    estimated_people_at_risk: 200000,
    recommended_actions: ['Water conservation', 'Relief supplies'],
    confidence_score: 95,
    data_sources: ['Precipitation data', 'Temperature trends'],
    status: 'completed',
    latitude: 26.9124,
    longitude: 75.7873,
    created_at: new Date().toISOString()
  }
]

async function migrateToFirebase() {
  try {
    const predictionsRef = collection(db, 'predictions')
    
    for (const prediction of predictions) {
      await addDoc(predictionsRef, prediction)
      console.log(`Added prediction for ${prediction.location}`)
    }
    
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Error during migration:', error)
  }
}

migrateToFirebase() 