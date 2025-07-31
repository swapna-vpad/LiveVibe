# Debug "Failed to Fetch" Error

## Issue
Getting "failed to fetch" error when attempting to login or sign up.

## Quick Debugging Steps

### Step 1: Test Database Connection
1. **Open your app** at `http://localhost:5173`
2. **Click the "🧪 Test DB" button** in the navigation
3. **Check browser console** (F12 → Console) for results

Expected results:
- ✅ Success: "Supabase connection successful!"
- ❌ Error: Specific error message

### Step 2: Check Network Tab
1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Try signing up/in**
4. **Look for failed requests** (red entries)
5. **Click on failed requests** to see error details

### Step 3: Verify Supabase Project Status
1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select project**: `rkvmxyufjmbknldbplub`
3. **Check project status**: Should be "Active" (green)
4. **Check if project is paused**: If paused, click "Resume"

## Common Causes & Solutions

### 1. Supabase Project Issues

#### Project Paused/Suspended
- **Solution**: Go to Supabase dashboard and resume the project
- **Check**: Project status should be "Active"

#### Wrong Project URL
- **Current**: `https://rkvmxyufjmbknldbplub.supabase.co`
- **Verify**: URL matches your project exactly

#### Invalid API Key
- **Check**: Anon key starts with `eyJ...`
- **Verify**: Key matches your project's anon key

### 2. Network/Connectivity Issues

#### Corporate Firewall
- **Try**: Different network (mobile hotspot)
- **Check**: VPN interference

#### DNS Issues
- **Try**: Clear DNS cache
- **Command**: `ipconfig /flushdns` (Windows)

#### Antivirus/Security Software
- **Try**: Temporarily disable antivirus
- **Check**: Windows Defender blocking requests

### 3. Browser Issues

#### Extensions Blocking Requests
- **Try**: Incognito/private mode
- **Check**: Ad blockers, privacy extensions

#### CORS Issues
- **Check**: Browser console for CORS errors
- **Solution**: Configure CORS in Supabase

## Troubleshooting Commands

### Test 1: Manual API Test
Open browser console and run:
```javascript
fetch('https://rkvmxyufjmbknldbplub.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrdm14eXVmam1ia25sZGJwbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTU1MjUsImV4cCI6MjA2NjQ3MTUyNX0.codnJhEOt1ZJekf7FTaAXAKOD4N697xUoutgMV_Bqtk'
  }
})
.then(response => console.log('✅ API Response:', response.status))
.catch(error => console.error('❌ API Error:', error));
```

### Test 2: Auth Endpoint Test
```javascript
fetch('https://rkvmxyufjmbknldbplub.supabase.co/auth/v1/settings', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrdm14eXVmam1ia25sZGJwbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTU1MjUsImV4cCI6MjA2NjQ3MTUyNX0.codnJhEOt1ZJekf7FTaAXAKOD4N697xUoutgMV_Bqtk'
  }
})
.then(response => response.json())
.then(data => console.log('✅ Auth Settings:', data))
.catch(error => console.error('❌ Auth Error:', error));
```

## Expected Error Messages

### "Failed to fetch"
- **Cause**: Network connectivity, firewall, or project issues
- **Solution**: Check network, project status, firewall

### "Invalid API key"
- **Cause**: Wrong anon key
- **Solution**: Update API key in supabase.ts

### "Project not found"
- **Cause**: Wrong project URL
- **Solution**: Verify project URL

### CORS errors
- **Cause**: CORS not configured properly
- **Solution**: Add localhost to allowed origins in Supabase

## Quick Fixes to Try

### Fix 1: Hard Refresh
1. Clear browser cache completely
2. Close all browser tabs
3. Restart browser
4. Open app in incognito mode

### Fix 2: Check Supabase Settings
1. Go to Supabase → Settings → API
2. Verify URL: `https://rkvmxyufjmbknldbplub.supabase.co`
3. Copy anon key and verify it matches

### Fix 3: Network Test
1. Try on different network (mobile hotspot)
2. Try different browser
3. Try from different device

### Fix 4: Project Health Check
1. Supabase Dashboard → Project Settings
2. Check billing status
3. Check usage limits
4. Check project logs for errors

## Next Steps Based on Test Results

### If API tests work:
- Issue is in the React app code
- Check component error handling
- Verify form data being sent

### If API tests fail:
- Issue is with Supabase connection
- Check project status
- Verify credentials
- Test network connectivity

### If only auth fails:
- Issue with auth configuration
- Check auth providers
- Verify auth settings

## Emergency Workaround

If nothing works, try creating a new Supabase project:
1. Create new project in Supabase
2. Copy new URL and anon key
3. Update src/lib/supabase.ts
4. Test connection 