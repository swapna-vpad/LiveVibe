# LiveVibe1 - Supabase Configuration

## Current Status

The application is configured to work in **development mode** with mock Supabase functionality. This allows you to see and interact with all the UI components without needing a real Supabase instance.

## Environment Variables

The application uses the following environment variables:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Development Mode (Current)

When environment variables are missing or invalid, the application automatically falls back to mock functionality:

- ✅ **Authentication** - Mock sign-in/sign-up with demo user
- ✅ **Database Operations** - Mock queries that return empty results
- ✅ **File Storage** - Mock uploads with placeholder URLs
- ✅ **All UI Components** - Fully functional and interactive

## Production Setup

To use real Supabase functionality:

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key

2. **Update Environment Variables**:
   ```bash
   # Create .env.local file
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run Database Migrations**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Link your project
   supabase link --project-ref your-project-ref

   # Run migrations
   supabase db push
   ```

## Database Schema

The application includes the following tables:

- `artist_profiles` - Artist information and portfolios
- `promoter_profiles` - Event organizer profiles
- `art_pieces` - Uploaded artwork and media
- `events` - Event listings and details
- `bookings` - Artist bookings and contracts
- `subscription_plans` - Pricing plans
- `user_subscriptions` - User subscription status
- `ai_generations_usage` - AI usage tracking
- `artist_availability` - Artist availability calendar
- `notifications` - User notifications

## Features Working in Development

- ✅ Complete UI/UX with all components
- ✅ Authentication modals (mock functionality)
- ✅ Artist profiles and portfolios
- ✅ AI Studio interface
- ✅ Booking system interface
- ✅ Pricing pages
- ✅ Responsive design
- ✅ All interactive elements

## Next Steps

1. **For Demo/Presentation**: The current setup is perfect for showcasing the application
2. **For Development**: Add real Supabase credentials to test full functionality
3. **For Production**: Set up proper Supabase instance with all migrations

## Troubleshooting

If you encounter issues:

1. **Blank Page**: Check browser console for errors
2. **Authentication Issues**: Verify environment variables are set correctly
3. **Database Errors**: Ensure migrations have been run
4. **Build Errors**: Check that all dependencies are installed

The application is designed to gracefully handle missing Supabase configuration and provide a full demo experience. 