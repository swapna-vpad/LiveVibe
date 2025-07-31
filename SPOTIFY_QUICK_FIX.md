# Spotify OAuth Quick Fix

## The Problem
You're getting a DNS error because the Spotify OAuth is trying to redirect to the old Supabase project URL that no longer exists.

## Solution

### Step 1: Configure Spotify OAuth in Supabase

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `rkvmxyufjmbknldbplub`

2. **Enable Spotify Provider**
   - Go to **Authentication** → **Providers**
   - Find **Spotify** in the list
   - Toggle it to **Enabled**

3. **Add Spotify Credentials**
   - **Client ID**: Your Spotify app client ID
   - **Client Secret**: Your Spotify app client secret
   - Click **Save**

### Step 2: Create Spotify App (if you haven't)

1. **Go to Spotify Developer Dashboard**
   - Visit: https://developer.spotify.com/dashboard
   - Sign in with your Spotify account

2. **Create New App**
   - Click "Create App"
   - **App name**: `Live Vibe`
   - **App description**: `AI-powered artist platform`
   - **Website**: `http://localhost:5173`
   - **Redirect URI**: `https://rkvmxyufjmbknldbplub.supabase.co/auth/v1/callback`
   - Click "Save"

3. **Get Credentials**
   - Copy your **Client ID**
   - Copy your **Client Secret**

### Step 3: Configure Supabase Redirect URLs

1. **In Supabase Dashboard**
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL**: `http://localhost:5173`
   - Add **Redirect URLs**:
     ```
     http://localhost:5173/**
     http://localhost:5174/**
     http://localhost:5175/**
     http://localhost:5176/**
     https://rkvmxyufjmbknldbplub.supabase.co/auth/v1/callback
     ```

### Step 4: Test the Fix

1. **Restart your dev server**:
   ```bash
   npm run dev
   ```

2. **Open your app** at `http://localhost:5173`

3. **Test Spotify Login**:
   - Click "Sign In" or "Create AI Videos"
   - Click "Continue with Spotify"
   - Should redirect to Spotify (not the old URL)

## Common Issues

### If you still get DNS errors:
- Make sure you're using the correct Supabase project URL
- Check that Spotify provider is enabled in Supabase
- Verify the redirect URI in Spotify app settings

### If you get "Invalid redirect URI":
- Double-check the redirect URI in your Spotify app
- Make sure it matches exactly: `https://rkvmxyufjmbknldbplub.supabase.co/auth/v1/callback`

### If you get "Provider not enabled":
- Go to Supabase → Authentication → Providers
- Make sure Spotify is toggled ON
- Save the settings

## Expected Flow After Fix

1. Click "Continue with Spotify"
2. Redirect to: `https://accounts.spotify.com/authorize?...`
3. User authorizes the app
4. Redirect to: `https://rkvmxyufjmbknldbplub.supabase.co/auth/v1/callback`
5. Supabase processes the OAuth
6. Redirect to: `http://localhost:5173` (your app)
7. User is signed in successfully

## Debug Steps

1. **Check browser console** for any errors
2. **Check Supabase logs** in the dashboard
3. **Verify all URLs** match exactly
4. **Test with incognito mode** to avoid cached redirects 