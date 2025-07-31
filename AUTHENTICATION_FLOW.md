# Live Vibe Authentication Flow

## Overview
The Live Vibe application uses Supabase for authentication and user management. The authentication flow is designed to seamlessly connect users to their profiles and guide them through the setup process.

## Authentication Components

### 1. AuthContext (`src/contexts/AuthContext.tsx`)
- Manages authentication state using Supabase
- Handles sign up, sign in, and sign out operations
- Automatically checks user profiles after authentication
- Dispatches events to trigger profile setup or profile display

### 2. AuthModal (`src/components/auth/AuthModal.tsx`)
- Modal container for authentication forms
- Switches between sign in and sign up modes
- Provides a clean, modern UI for authentication

### 3. SignInForm (`src/components/auth/SignInForm.tsx`)
- Email and password authentication
- Connected to Supabase auth
- Automatically redirects to profile or profile setup after successful sign in

### 4. SignUpForm (`src/components/auth/SignUpForm.tsx`)
- New user registration with email and password
- Connected to Supabase auth
- Automatically triggers profile setup after successful sign up

## Authentication Flow

### Sign Up Flow
1. User clicks "Create AI Videos" or "Sign Up" button
2. AuthModal opens with SignUpForm
3. User enters email and password
4. Form submits to Supabase auth
5. On successful sign up:
   - Success toast is shown
   - Auth modal closes
   - Profile setup modal opens automatically
   - User completes profile setup

### Sign In Flow
1. User clicks "Sign In" button
2. AuthModal opens with SignInForm
3. User enters email and password
4. Form submits to Supabase auth
5. On successful sign in:
   - Success toast is shown
   - Auth modal closes
   - System checks if user has a profile
   - If profile exists: Artist Profile modal opens
   - If no profile: Profile setup modal opens

### Profile Setup Flow
1. Triggered automatically after sign up or if user has no profile
2. ArtistProfileSetup component opens
3. User completes multi-step profile setup:
   - Basic information (name, location, etc.)
   - Artist type and categories
   - Music genres and instruments
   - Social media links
   - Profile photo upload
4. Profile is saved to Supabase
5. User can then access their profile and start using the platform

## Supabase Integration

### Database Tables
- `users` (managed by Supabase Auth)
- `artist_profiles` (custom user profiles)
- `promoter_profiles` (event organizer profiles)
- `art_pieces` (user uploaded content)
- `events` (event listings)
- `bookings` (booking requests)

### Authentication Methods
- Email/Password authentication
- OAuth providers (configured but not fully implemented)
- Session management with automatic token refresh

## Event System
The application uses custom events to coordinate between components:

- `showProfile`: Opens the artist profile modal
- `startProfileSetup`: Opens the profile setup modal
- `showPricingAfterSignup`: Shows pricing after signup
- `openSignupModal`: Opens the signup modal
- `closeAuthModal`: Closes the auth modal

## Security Features
- Password validation (minimum 6 characters)
- Email verification (handled by Supabase)
- Secure session management
- Row Level Security (RLS) on database tables
- Input validation and sanitization

## Error Handling
- Comprehensive error messages for authentication failures
- Graceful fallbacks for network issues
- User-friendly error toasts
- Console logging for debugging

## Testing the Flow
1. Open the application at `http://localhost:5173/`
2. Click "Create AI Videos" to test sign up flow
3. Click "Sign In" to test sign in flow
4. Check browser console for detailed logging
5. Verify that profile setup opens after sign up
6. Verify that profile displays after sign in (if profile exists)

## Configuration
The Supabase configuration is in `src/lib/supabase.ts`:
- URL: `https://0fbeB8j4wmaKgHgR0eFE0g.supabase.co`
- Anon Key: Configured for client-side access
- Auth settings: Auto refresh tokens, persist sessions

## Next Steps
- Implement OAuth providers (Google, GitHub, etc.)
- Add email verification flow
- Implement password reset functionality
- Add two-factor authentication
- Enhance profile validation 