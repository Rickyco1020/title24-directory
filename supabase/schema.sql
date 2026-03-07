-- cities
CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  county TEXT NOT NULL,
  county_slug TEXT NOT NULL,
  lat FLOAT,
  lng FLOAT,
  population INT
);

-- counties
CREATE TABLE IF NOT EXISTS counties (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  lat FLOAT,
  lng FLOAT
);

-- raters
CREATE TABLE IF NOT EXISTS raters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','featured')),
  business_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  services TEXT[] NOT NULL,
  cities_served TEXT[],
  counties_served TEXT[],
  description TEXT,
  license_number TEXT
);

-- Row Level Security
ALTER TABLE raters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read approved" ON raters
  FOR SELECT USING (status IN ('approved','featured'));
