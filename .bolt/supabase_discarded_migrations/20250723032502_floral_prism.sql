/*
  # Event Booking System

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `organizer_id` (uuid, references users)
      - `title` (text)
      - `description` (text)
      - `event_date` (timestamp)
      - `venue_name` (text)
      - `venue_address` (text)
      - `city` (text)
      - `state` (text)
      - `country` (text)
      - `budget_min` (integer)
      - `budget_max` (integer)
      - `required_genres` (text[])
      - `event_type` (text)
      - `duration_hours` (integer)
      - `audience_size` (integer)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `bookings`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `artist_id` (uuid, references users)
      - `organizer_id` (uuid, references users)
      - `status` (text)
      - `proposed_fee` (integer)
      - `final_fee` (integer)
      - `booking_date` (timestamp)
      - `contract_terms` (text)
      - `payment_status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `artist_availability`
      - `id` (uuid, primary key)
      - `artist_id` (uuid, references users)
      - `date` (date)
      - `is_available` (boolean)
      - `time_slots` (text[])
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for events and artist profiles
*/

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  event_date timestamptz NOT NULL,
  venue_name text NOT NULL,
  venue_address text NOT NULL,
  city text NOT NULL,
  state text,
  country text NOT NULL,
  budget_min integer DEFAULT 0,
  budget_max integer DEFAULT 0,
  required_genres text[] DEFAULT '{}',
  event_type text CHECK (event_type IN ('concert', 'festival', 'wedding', 'corporate', 'private_party', 'club', 'restaurant', 'other')) DEFAULT 'other',
  duration_hours integer DEFAULT 2,
  audience_size integer DEFAULT 0,
  status text CHECK (status IN ('draft', 'published', 'booking_open', 'booking_closed', 'completed', 'cancelled')) DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organizer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')) DEFAULT 'pending',
  proposed_fee integer DEFAULT 0,
  final_fee integer DEFAULT 0,
  booking_date timestamptz DEFAULT now(),
  contract_terms text DEFAULT '',
  payment_status text CHECK (payment_status IN ('pending', 'deposit_paid', 'fully_paid', 'refunded')) DEFAULT 'pending',
  message text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Artist availability table
CREATE TABLE IF NOT EXISTS artist_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_available boolean DEFAULT true,
  time_slots text[] DEFAULT '{}',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(artist_id, date)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS events_organizer_id_idx ON events(organizer_id);
CREATE INDEX IF NOT EXISTS events_event_date_idx ON events(event_date);
CREATE INDEX IF NOT EXISTS events_city_idx ON events(city);
CREATE INDEX IF NOT EXISTS events_status_idx ON events(status);
CREATE INDEX IF NOT EXISTS events_required_genres_idx ON events USING GIN(required_genres);

CREATE INDEX IF NOT EXISTS bookings_event_id_idx ON bookings(event_id);
CREATE INDEX IF NOT EXISTS bookings_artist_id_idx ON bookings(artist_id);
CREATE INDEX IF NOT EXISTS bookings_organizer_id_idx ON bookings(organizer_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);

CREATE INDEX IF NOT EXISTS artist_availability_artist_id_idx ON artist_availability(artist_id);
CREATE INDEX IF NOT EXISTS artist_availability_date_idx ON artist_availability(date);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_availability ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Public can read published events"
  ON events
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('published', 'booking_open'));

CREATE POLICY "Organizers can manage own events"
  ON events
  FOR ALL
  TO authenticated
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

-- Bookings policies
CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid() OR organizer_id = auth.uid());

CREATE POLICY "Artists can create booking responses"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (artist_id = auth.uid());

CREATE POLICY "Organizers can create booking requests"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (artist_id = auth.uid() OR organizer_id = auth.uid())
  WITH CHECK (artist_id = auth.uid() OR organizer_id = auth.uid());

-- Artist availability policies
CREATE POLICY "Public can read artist availability"
  ON artist_availability
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Artists can manage own availability"
  ON artist_availability
  FOR ALL
  TO authenticated
  USING (artist_id = auth.uid())
  WITH CHECK (artist_id = auth.uid());

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();