# Manual Test Commands

If the "🧪 Test DB" button doesn't work, you can run these commands directly in your browser console.

## How to Open Browser Console
1. **Press F12** or **Right-click → Inspect**
2. **Click "Console" tab**
3. **Paste the commands below** and press Enter

## Test Commands

### Test 1: Basic Connectivity
```javascript
console.log('🧪 Testing basic connectivity...')
fetch('https://rkvmxyufjmbknldbplub.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrdm14eXVmam1ia25sZGJwbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTU1MjUsImV4cCI6MjA2NjQ3MTUyNX0.codnJhEOt1ZJekf7FTaAXAKOD4N697xUoutgMV_Bqtk'
  }
})
.then(response => {
  if (response.ok) {
    console.log('✅ SUCCESS: Supabase is reachable! Status:', response.status)
  } else {
    console.log('❌ FAILED: Bad response. Status:', response.status)
  }
  return response.text()
})
.then(data => console.log('📄 Response:', data))
.catch(error => console.error('💥 ERROR:', error))
```

### Test 2: Auth Endpoint Test
```javascript
console.log('🔐 Testing auth endpoint...')
fetch('https://rkvmxyufjmbknldbplub.supabase.co/auth/v1/settings', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrdm14eXVmam1ia25sZGJwbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTU1MjUsImV4cCI6MjA2NjQ3MTUyNX0.codnJhEOt1ZJekf7FTaAXAKOD4N697xUoutgMV_Bqtk'
  }
})
.then(response => response.json())
.then(data => {
  console.log('✅ AUTH SUCCESS: Auth endpoint is working!')
  console.log('📄 Auth settings:', data)
})
.catch(error => console.error('💥 AUTH ERROR:', error))
```

### Test 3: Database Query Test
```javascript
console.log('📊 Testing database query...')
fetch('https://rkvmxyufjmbknldbplub.supabase.co/rest/v1/artist_profiles?select=count&limit=1', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrdm14eXVmam1ia25sZGJwbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTU1MjUsImV4cCI6MjA2NjQ3MTUyNX0.codnJhEOt1ZJekf7FTaAXAKOD4N697xUoutgMV_Bqtk',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('✅ DATABASE SUCCESS: Database is accessible!')
  console.log('📊 Query result:', data)
})
.catch(error => console.error('💥 DATABASE ERROR:', error))
```

### Test 4: Complete Test (All in One)
```javascript
console.log('🚀 Running complete Supabase test...')

async function runCompleteTest() {
  try {
    // Test 1: Basic connectivity
    console.log('1️⃣ Testing basic connectivity...')
    const basicResponse = await fetch('https://rkvmxyufjmbknldbplub.supabase.co/rest/v1/', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrdm14eXVmam1ia25sZGJwbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTU1MjUsImV4cCI6MjA2NjQ3MTUyNX0.codnJhEOt1ZJekf7FTaAXAKOD4N697xUoutgMV_Bqtk'
      }
    })
    console.log('✅ Basic connectivity:', basicResponse.ok ? 'SUCCESS' : 'FAILED')
    
    // Test 2: Auth endpoint
    console.log('2️⃣ Testing auth endpoint...')
    const authResponse = await fetch('https://rkvmxyufjmbknldbplub.supabase.co/auth/v1/settings', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrdm14eXVmam1ia25sZGJwbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTU1MjUsImV4cCI6MjA2NjQ3MTUyNX0.codnJhEOt1ZJekf7FTaAXAKOD4N697xUoutgMV_Bqtk'
      }
    })
    console.log('✅ Auth endpoint:', authResponse.ok ? 'SUCCESS' : 'FAILED')
    
    // Test 3: Database query
    console.log('3️⃣ Testing database access...')
    const dbResponse = await fetch('https://rkvmxyufjmbknldbplub.supabase.co/rest/v1/artist_profiles?select=count&limit=1', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrdm14eXVmam1ia25sZGJwbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTU1MjUsImV4cCI6MjA2NjQ3MTUyNX0.codnJhEOt1ZJekf7FTaAXAKOD4N697xUoutgMV_Bqtk',
        'Content-Type': 'application/json'
      }
    })
    console.log('✅ Database access:', dbResponse.ok ? 'SUCCESS' : 'FAILED')
    
    console.log('🎉 TEST COMPLETE! Check results above.')
    
  } catch (error) {
    console.error('💥 TEST FAILED:', error)
  }
}

runCompleteTest()
```

## Expected Results

### ✅ Success (All Working)
```
✅ SUCCESS: Supabase is reachable! Status: 200
✅ AUTH SUCCESS: Auth endpoint is working!
✅ DATABASE SUCCESS: Database is accessible!
```

### ❌ Common Errors

#### Network Error
```
💥 ERROR: TypeError: Failed to fetch
```
**Solution**: Check internet connection, firewall, or VPN

#### CORS Error
```
💥 ERROR: Access to fetch blocked by CORS policy
```
**Solution**: Add localhost to Supabase CORS settings

#### Project Not Found
```
❌ FAILED: Bad response. Status: 404
```
**Solution**: Verify project URL is correct

#### Invalid API Key
```
❌ FAILED: Bad response. Status: 401
```
**Solution**: Verify API key is correct

## Quick Troubleshooting

1. **If all tests fail**: Check internet connection
2. **If only auth fails**: Check auth configuration
3. **If only database fails**: Check database tables exist
4. **If CORS errors**: Configure CORS in Supabase dashboard

## Run These Tests

1. **Copy any test command above**
2. **Open browser console** (F12)
3. **Paste and press Enter**
4. **Check the results**
5. **Share the results** with me for further help 