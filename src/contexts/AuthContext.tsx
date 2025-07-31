import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { enhancedSupabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
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
      console.log('AuthContext: Making request to Supabase...')
      const response = await enhancedSupabase.auth.signUp({
        email,
        password,
      })
      console.log('AuthContext: Sign up response:', response)
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
      console.log('AuthContext: Making sign in request to Supabase...')
      const response = await enhancedSupabase.auth.signInWithPassword({
        email,
        password,
      })
      console.log('AuthContext: Sign in response:', response)
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