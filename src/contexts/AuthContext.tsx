import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { enhancedSupabase } from '@/lib/supabase'
import { AuthTableService, AuthTableUser } from '@/lib/auth-table'

interface AuthContextType {
  user: User | null
  authTableUser: AuthTableUser | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authTableUser, setAuthTableUser] = useState<AuthTableUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    enhancedSupabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('AuthContext: Error getting initial session:', error)
      }
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(error => {
      console.error('AuthContext: Failed to get initial session:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = enhancedSupabase.auth.onAuthStateChange((_event: string, session: any) => {
      console.log('AuthContext: Auth state changed:', { event: _event, session })
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // If user just signed in, check if they have a profile
      if (_event === 'SIGNED_IN' && session?.user) {
        console.log('AuthContext: User signed in, checking profile')
        checkUserProfile(session.user.id)
      }
      
      // If user just signed up, trigger profile setup
      if (_event === 'SIGNED_UP' && session?.user) {
        console.log('AuthContext: User signed up, triggering profile setup')
        setTimeout(() => {
          const profileSetupEvent = new CustomEvent('startProfileSetup')
          window.dispatchEvent(profileSetupEvent)
        }, 500)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    console.log('AuthContext: Attempting sign up for:', email)
    try {
      console.log('AuthContext: Using auth_table for signup...')
      
      // Extract username from email (before @)
      const username = email.split('@')[0]
      
      const response = await AuthTableService.signUp({
        user_name: username,
        email,
        password,
        module: 'artist'
      })
      
      if (response.error) {
        console.error('AuthContext: Auth table signup failed:', response.error)
        return { error: response.error }
      }
      
      if (response.user) {
        console.log('AuthContext: Auth table user created:', response.user)
        setAuthTableUser(response.user)
        
        // Create a mock Supabase user for compatibility
        const mockUser = {
          id: response.user.id.toString(),
          email: response.user.email,
          user_metadata: {
            user_name: response.user.user_name,
            module: response.user.module
          }
        } as User
        
        setUser(mockUser)
        
        // Trigger profile setup
        setTimeout(() => {
          const profileSetupEvent = new CustomEvent('startProfileSetup')
          window.dispatchEvent(profileSetupEvent)
        }, 500)
      }
      
      console.log('AuthContext: Auth table signup response:', response)
      return { error: response.error }
    } catch (error: any) {
      console.error('AuthContext: Sign up failed with error:', error)
      
      // Specific error handling
      if (error.message?.includes('fetch')) {
        return { error: { message: 'Connection failed. Please check your internet connection and try again.' } }
      }
      if (error.message?.includes('CORS')) {
        return { error: { message: 'CORS error. Please contact support.' } }
      }
      if (error.name === 'TypeError') {
        return { error: { message: 'Network error. Please check if you can access the internet.' } }
      }
      
      return { error: { message: error.message || 'Unknown network error occurred.' } }
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext: Attempting sign in for:', email)
    try {
      console.log('AuthContext: Using auth_table for signin...')
      
      const response = await AuthTableService.signIn({
        email_or_username: email,
        password
      })
      
      if (response.error) {
        console.error('AuthContext: Auth table signin failed:', response.error)
        return { error: response.error }
      }
      
      if (response.user) {
        console.log('AuthContext: Auth table user authenticated:', response.user)
        setAuthTableUser(response.user)
        
        // Create a mock Supabase user for compatibility
        const mockUser = {
          id: response.user.id.toString(),
          email: response.user.email,
          user_metadata: {
            user_name: response.user.user_name,
            module: response.user.module
          }
        } as User
        
        setUser(mockUser)
        
        // Check for existing profile
        checkUserProfile(response.user.id.toString())
      }
      
      console.log('AuthContext: Auth table signin response:', response)
      return { error: response.error }
    } catch (error: any) {
      console.error('AuthContext: Sign in failed with error:', error)
      
      // Specific error handling
      if (error.message?.includes('fetch')) {
        return { error: { message: 'Connection failed. Please check your internet connection and try again.' } }
      }
      if (error.message?.includes('CORS')) {
        return { error: { message: 'CORS error. Please contact support.' } }
      }
      if (error.name === 'TypeError') {
        return { error: { message: 'Network error. Please check if you can access the internet.' } }
      }
      
      return { error: { message: error.message || 'Unknown network error occurred.' } }
    }
  }

  const signOut = async () => {
    // Clear auth table user
    setAuthTableUser(null)
    setUser(null)
    setSession(null)
    
    // Also sign out from Supabase auth if there's a session
    await enhancedSupabase.auth.signOut()
  }

  const checkUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await enhancedSupabase
        .from('artist_profiles')
        .select('id')
        .eq('user_id', userId)
        .single()
      
      if (error || !profile) {
        // No profile found, trigger profile setup
        console.log('AuthContext: No profile found, triggering profile setup')
        setTimeout(() => {
          const profileSetupEvent = new CustomEvent('startProfileSetup')
          window.dispatchEvent(profileSetupEvent)
        }, 500)
      } else {
        // Profile exists, show profile
        console.log('AuthContext: Profile found, showing profile')
        setTimeout(() => {
          const showProfileEvent = new CustomEvent('showProfile')
          window.dispatchEvent(showProfileEvent)
        }, 500)
      }
    } catch (error) {
      console.error('AuthContext: Error checking user profile:', error)
      // Fallback to showing profile
      setTimeout(() => {
        const showProfileEvent = new CustomEvent('showProfile')
        window.dispatchEvent(showProfileEvent)
      }, 500)
    }
  }

  const value = {
    user,
    authTableUser,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}