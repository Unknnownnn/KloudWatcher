-- Drop the existing table if it exists
DROP TABLE IF EXISTS predictions;

-- Create the predictions table with the correct structure
CREATE TABLE predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  disaster_type TEXT NOT NULL,
  location TEXT NOT NULL,
  prediction TEXT NOT NULL,
  affected_areas TEXT[] NOT NULL,
  estimated_people_at_risk INTEGER NOT NULL,
  recommended_actions TEXT[] NOT NULL,
  confidence_score INTEGER NOT NULL,
  data_sources TEXT[] NOT NULL,
  status TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  priority TEXT NOT NULL,
  name TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated and anonymous users
CREATE POLICY "Enable all access for all users" ON predictions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert the existing disaster data
INSERT INTO predictions (
  disaster_type,
  location,
  prediction,
  affected_areas,
  estimated_people_at_risk,
  recommended_actions,
  confidence_score,
  data_sources,
  status,
  latitude,
  longitude,
  priority,
  name
)
VALUES
  (
    'testing flood',
    'Kerala, India',
    'Severe flooding in Kerala due to heavy monsoon rains.',
    ARRAY['Coastal Areas', 'Low-lying Regions'],
    12450,
    ARRAY['Evacuation', 'Emergency supplies'],
    90,
    ARRAY['Weather data', 'Historical records'],
    'completed',
    10.8505,
    76.2711,
    'high',
    'Kerala Floods'
  ),
  (
    'testing cyclone',
    'West Bengal, India',
    'Powerful tropical cyclone affecting West Bengal and Odisha.',
    ARRAY['Coastal Areas', 'Urban Centers'],
    8750,
    ARRAY['Shelter preparation', 'Early warning'],
    85,
    ARRAY['Satellite data', 'Weather models'],
    'completed',
    22.9868,
    87.8550,
    'medium',
    'Cyclone Amphan'
  ),
  (
    'landslide',
    'Uttarakhand, India',
    'Landslides in Uttarakhand caused by heavy rainfall.',
    ARRAY['Mountain Areas', 'Valley Regions'],
    3389,
    ARRAY['Area evacuation', 'Road closure'],
    80,
    ARRAY['Rainfall data', 'Soil analysis'],
    'completed',
    30.0668,
    79.0193,
    'high',
    'Uttarakhand Landslide'
  ); 