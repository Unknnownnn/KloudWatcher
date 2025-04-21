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
  longitude DOUBLE PRECISION NOT NULL
);

-- Enable Row Level Security
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated and anonymous users
CREATE POLICY "Enable all access for all users" ON predictions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert test data
INSERT INTO predictions (disaster_type, location, prediction, affected_areas, estimated_people_at_risk, recommended_actions, confidence_score, data_sources, status, latitude, longitude)
VALUES
  ('flood', 'Mumbai, India', 'Severe flooding expected in coastal areas', ARRAY['South Mumbai', 'Suburbs'], 50000, ARRAY['Evacuation', 'Emergency supplies'], 85, ARRAY['Weather data', 'Historical records'], 'completed', 19.0760, 72.8777),
  ('cyclone', 'Chennai, India', 'Category 3 cyclone approaching', ARRAY['Marina Beach', 'T Nagar'], 75000, ARRAY['Shelter preparation', 'Early warning'], 90, ARRAY['Satellite data', 'Weather models'], 'completed', 13.0827, 80.2707),
  ('earthquake', 'Delhi, India', 'High seismic activity detected', ARRAY['Old Delhi', 'New Delhi'], 100000, ARRAY['Building evacuation', 'Emergency response'], 75, ARRAY['Seismic sensors', 'Geological data'], 'completed', 28.6139, 77.2090),
  ('landslide', 'Shimla, India', 'Risk of landslides due to heavy rainfall', ARRAY['Mall Road', 'Ridge'], 25000, ARRAY['Area evacuation', 'Road closure'], 80, ARRAY['Rainfall data', 'Soil analysis'], 'completed', 31.1048, 77.1734),
  ('drought', 'Rajasthan, India', 'Severe drought conditions expected', ARRAY['Jaipur', 'Jodhpur'], 200000, ARRAY['Water conservation', 'Relief supplies'], 95, ARRAY['Precipitation data', 'Temperature trends'], 'completed', 26.9124, 75.7873); 