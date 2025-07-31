# Spotify OAuth Setup Guide

## Overview
This guide will help you configure Spotify OAuth authentication in your Supabase project for the Live Vibe application.

## Step 1: Create a Spotify App

1. **Go to Spotify Developer Dashboard**
   - Visit: https://developer.spotify.com/dashboard
   - Sign in with your Spotify account

2. **Create a New App**
   - Click "Create App"
   - Fill in the details:
     - **App name**: `Live Vibe`
     - **App description**: `AI-powered artist platform for music creators`
     - **Website**: `http://localhost:5173` (for development)
     - **Redirect URI**: `https://rkvmxyufjmbknldbplub.supabase.co/auth/v1/callback`
     - **API/SDKs**: Select "Web API"
   - Click "Save"

3. **Get Your Credentials**
   - Note down your **Client ID**
   - Note down your **Client Secret**

## Step 2: Configure Supabase OAuth

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `rkvmxyufjmbknldbplub`

2. **Navigate to Authentication Settings**
   - Go to **Authentication** → **Providers**
   - Find **Spotify** in the list

3. **Enable Spotify Provider**
   - Toggle **Spotify** to **Enabled**
   - Enter your Spotify credentials:
     - **Client ID**: Your Spotify app client ID
     - **Client Secret**: Your Spotify app client secret
   - Click **Save**

## Step 3: Configure Redirect URLs

### In Spotify Developer Dashboard:
1. Go to your app settings
2. Add these redirect URIs:
   ```
   https://rkvmxyufjmbknldbplub.supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback
   http://localhost:5174/auth/callback
   http://localhost:5175/auth/callback
   http://localhost:5176/auth/callback
   ```

### In Supabase Dashboard:
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:5173`
3. Add **Redirect URLs**:
   ```
   http://localhost:5173/**
   http://localhost:5174/**
   http://localhost:5175/**
   http://localhost:5176/**
   ```

## Step 4: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Open your app** at `http://localhost:5173`

3. **Test Spotify Login**:
   - Click "Sign In" or "Create AI Videos"
   - Click "Continue with Spotify"
   - You should be redirected to Spotify for authorization
   - After authorization, you'll be redirected back to your app

## Step 5: Handle User Data

The Spotify OAuth will provide:
- **Email**: User's Spotify email
- **Display Name**: User's Spotify display name
- **Profile Image**: User's Spotify profile image
- **Spotify ID**: Unique Spotify user ID

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**
   - Make sure the redirect URI in Spotify matches exactly
   - Check for trailing slashes or protocol mismatches

2. **"Client ID not found"**
   - Verify your Spotify Client ID is correct
   - Make sure the app is published (not in development mode)

3. **"CORS errors"**
   - Add your localhost URLs to Spotify's allowed origins
   - Check Supabase CORS settings

4. **"Provider not enabled"**
   - Make sure Spotify is enabled in Supabase Authentication → Providers

### Debug Steps:
1. Check browser console for errors
2. Check Supabase logs in the dashboard
3. Verify all URLs match exactly
4. Test with a fresh browser session

## Security Notes

- ✅ Client ID is safe to expose in client-side code
- ❌ Never expose Client Secret in client-side code
- ✅ Supabase handles the OAuth flow securely
- ✅ User data is stored securely in Supabase

## Next Steps

After successful setup:
1. Test the complete authentication flow
2. Customize the user profile setup for Spotify users
3. Add Spotify-specific features (playlist integration, etc.)
4. Consider adding other OAuth providers (Google, GitHub, etc.)

## Example Spotify User Flow

1. User clicks "Continue with Spotify"
2. Redirected to Spotify authorization page
3. User authorizes the app
4. Redirected back to Live Vibe
5. User account created/authenticated
6. Profile setup modal opens (if new user)
7. User can access all Live Vibe features 