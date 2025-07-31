# Supabase Configuration Guide

## Current Configuration
- **URL**: `https://rkvmxyufjmbknldbplub.supabase.co`
- **Anon Key**: Needs to be configured

## How to Get Your Anon Key

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in to your account

2. **Select Your Project**
   - Click on your project: `rkvmxyufjmbknldbplub`

3. **Navigate to API Settings**
   - Go to Settings → API
   - Or click the gear icon → API

4. **Copy the Anon Key**
   - Look for "Project API keys"
   - Copy the "anon public" key (starts with `eyJ...`)

## Configuration Options

### Option 1: Environment Variables (Recommended)
Create a `.env` file in your project root:
```env
VITE_SUPABASE_URL=https://rkvmxyufjmbknldbplub.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### Option 2: Direct Configuration
Update `src/lib/supabase.ts`:
```typescript
const supabaseAnonKey = 'your_actual_anon_key_here'
```

## Testing the Connection

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser** to `http://localhost:5175/`

3. **Click the "🧪 Test DB" button** in the navigation

4. **Check the console** (F12 → Console) for results

## Expected Results

### ✅ Success
```
🔍 Testing Supabase connection...
📡 Testing basic connection...
✅ Supabase connection successful!
📊 Response data: [...]
🔐 Testing auth status...
👤 Current session: None
```

### ❌ Configuration Error
```
❌ Supabase configuration error:
Please set your Supabase anon key in the .env file or update the configuration.
```

### ❌ Connection Error
```
❌ Supabase connection failed: [error details]
```

## CORS Configuration

If you see CORS errors, add these origins to your Supabase project:
1. Go to Settings → API
2. Add to "Additional Allowed Origins":
   - `http://localhost:5173`
   - `http://localhost:5174`
   - `http://localhost:5175`
   - `http://localhost:3000`

## Security Notes

- ✅ The anon key is safe to use in client-side code
- ✅ It only has the permissions you've configured in your RLS policies
- ❌ Never commit your service role key to client-side code
- ❌ Never commit your .env file to version control

## Next Steps

1. Get your anon key from Supabase dashboard
2. Configure it using one of the options above
3. Test the connection using the "🧪 Test DB" button
4. If successful, try signing up/signing in 