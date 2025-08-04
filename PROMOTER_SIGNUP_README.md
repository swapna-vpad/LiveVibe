# Promoter Signup Form

## Overview
A new dedicated signup form for promoters has been added to the Live Vibe application. This form includes specific fields tailored for promoter accounts and integrates seamlessly with the existing authentication flow.

## Features

### Form Fields
The promoter signup form includes the following fields:

#### Required Fields:
- **First Name** - User's first name
- **Last Name** - User's last name  
- **Email Address** - User's email for account creation
- **City Location** - User's city for location-based matching
- **Password** - Account password (minimum 6 characters)
- **Confirm Password** - Password confirmation
- **Creator Type** - Type of creator the promoter works with
- **Platform** - Preferred platform (iOS/Android)

#### Optional Fields:
- **Stage Name** - Professional stage name or alias

### Creator Type Selection
Users can select from the following creator types:
- 🎨 Artist
- 🎸 Band
- 🎭 Curator
- 🎧 DJ
- 📚 Educator
- 🎙️ Podcaster
- 🎛️ Producer
- 🏢 Venue
- 🎼 Musician
- 🎤 Singer-Songwriter

### Platform Selection
Users can choose their preferred platform:
- 📱 iOS
- 🤖 Android

## Implementation Details

### Files Created/Modified:
1. **`src/components/auth/PromoterSignUpForm.tsx`** - New component for promoter signup
2. **`src/components/auth/SignUpForm.tsx`** - Modified to integrate promoter signup flow
3. **Database Migration** - Added new fields to `promoter_profiles` table

### Database Schema Changes:
The following fields were added to the `promoter_profiles` table:
- `first_name` (TEXT)
- `last_name` (TEXT) 
- `stage_name` (TEXT)
- `creator_type` (TEXT) - with check constraint for valid values
- `platform` (TEXT) - with check constraint for 'ios' or 'android'

### Integration Flow:
1. User selects "Promoter" from the role selection screen
2. Promoter signup form is displayed with all required fields
3. Form validation ensures all required fields are completed
4. On successful submission:
   - User account is created in Supabase Auth
   - User data is saved to `auth_table`
   - Promoter profile is created in `promoter_profiles` table
   - User is redirected to profile setup

## Usage

### For Users:
1. Navigate to the signup page
2. Select "Promoter" as your role
3. Fill in all required fields
4. Select your preferred creator type and platform
5. Submit the form to create your account

### For Developers:
The promoter signup form is automatically integrated into the existing signup flow. When a user selects "Promoter" as their role, the `PromoterSignUpForm` component is rendered instead of the standard signup form.

## Styling
The form uses the existing design system with:
- Teal/blue gradient theme for promoter-specific styling
- Consistent form field styling with icons
- Responsive design for mobile and desktop
- Dropdown menus for creator type and platform selection

## Validation
- All required fields must be completed
- Password must be at least 6 characters
- Passwords must match
- Creator type and platform must be selected
- Email format validation
- Duplicate email detection

## Error Handling
- Form validation errors are displayed via toast notifications
- Database errors are caught and displayed to the user
- Existing account detection with appropriate messaging
- Network error handling

## Future Enhancements
- Additional creator type options
- More platform options (web, desktop, etc.)
- Enhanced validation rules
- Integration with external verification services
- Multi-step form with progress indicator 