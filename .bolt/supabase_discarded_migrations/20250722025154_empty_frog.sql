/*
  # Populate subscription plans

  1. Insert all subscription plans
    - Artist plans: Vibe Starter (Free), Vibe Pro ($15/mo), Vibe Elite ($35/mo)
    - Organizer plans: Vibe Discovery (Free), Vibe Pro ($25/mo), Vibe Elite ($60/mo)
  2. Include all features and commission rates
  3. Set proper pricing for monthly and yearly billing
*/

-- Insert Artist Plans
INSERT INTO subscription_plans (name, type, tier, price_monthly, price_yearly, features, commission_rate, ai_generations, active) VALUES
(
  'Vibe Starter',
  'artist',
  'starter',
  0,
  0,
  ARRAY[
    'Create a public, shareable Artist Profile',
    'Be listed in the Booking Marketplace',
    'Receive booking requests',
    'Basic analytics (profile views, number of inquiries)',
    'Join community event rooms',
    '1 free AI video generation per month (with watermark)',
    'Standard listing in search results'
  ],
  0.10,
  1,
  true
),
(
  'Vibe Pro',
  'artist',
  'pro',
  1500,
  15000,
  ARRAY[
    'All Vibe Starter features',
    '10 AI video generations per month (no watermark)',
    'One-click publishing to TikTok, Instagram, and YouTube',
    'Advanced Analytics: engagement stats, follower growth',
    'Featured placement in search results',
    'Calendar Integration: Auto-sync bookings',
    'Collaboration Finder: Full access to find collaborators'
  ],
  0.10,
  10,
  true
),
(
  'Vibe Elite',
  'artist',
  'elite',
  3500,
  35000,
  ARRAY[
    'All Vibe Pro features',
    'Unlimited AI video generations',
    'Access to premium visual styles and templates',
    'Reduced Booking Commission: 7%',
    'Elite Artist badge and highest priority in search',
    'Personal, embeddable booking widget',
    'Merch & Livestream Integration',
    'Priority customer support'
  ],
  0.07,
  -1,
  true
);

-- Insert Organizer Plans
INSERT INTO subscription_plans (name, type, tier, price_monthly, price_yearly, features, commission_rate, ai_generations, active) VALUES
(
  'Vibe Discovery',
  'organizer',
  'starter',
  0,
  0,
  ARRAY[
    'Create an Organizer Profile',
    'Browse and search the entire Artist Marketplace',
    'Send booking requests to any artist',
    'Bookmark favorite artists',
    'Limited to 3 AI-powered artist suggestions per week',
    'Can only manage 1 active event at a time'
  ],
  0.10,
  3,
  true
),
(
  'Vibe Pro',
  'organizer',
  'pro',
  2500,
  25000,
  ARRAY[
    'All Vibe Discovery features',
    'Unlimited Event Management',
    'Advanced Search Filters: availability, price range',
    'Smart AI Suggestions: Unlimited tailored recommendations',
    'Calendar Integration: Sync all event dates',
    'Contract Management: Templates and in-app signing',
    'Post on the Collaborator Finder board'
  ],
  0.10,
  -1,
  true
),
(
  'Vibe Elite',
  'organizer',
  'elite',
  6000,
  60000,
  ARRAY[
    'All Vibe Pro features',
    'Team Accounts: Add multiple team members',
    'Reduced Commission: Artists pay only 8% for your bookings',
    'Direct Outreach Tools: Contact multiple artists at once',
    'Custom Analytics & Reporting: booking spend, ROI',
    'Dedicated account manager and priority support'
  ],
  0.08,
  -1,
  true
);