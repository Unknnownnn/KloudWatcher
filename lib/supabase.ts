import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Disaster = {
  id: string
  created_at: string
  type: string
  location: string
  description: string
  severity: number
  affected_areas: string[]
  recommended_actions: string[]
  estimated_impact: number
  status: 'active' | 'resolved' | 'monitoring'
}

export type Prediction = {
  id: string
  created_at: string
  disaster_type: string
  location: string
  prediction: string
  affected_areas: string[]
  estimated_people_at_risk: number
  recommended_actions: string[]
  confidence_score: number
  data_sources: string[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  latitude: number
  longitude: number
  priority: 'high' | 'medium' | 'low'
  name: string
} 