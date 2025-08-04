import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { enhancedSupabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userType: 'artist' | 'promoter') => Promise<{ error: any }>
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
        checkUserProfileAndRedirect(session.user.id)
      }
      
      // If user signed in via OAuth, check if we need to create profile
      if (_event === 'SIGNED_IN' && session?.user) {
        console.log('AuthContext: User signed in via OAuth, checking if profile exists')
        handleOAuthSignIn(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userType: 'artist' | 'promoter') => {
    console.log('AuthContext: Attempting sign up for:', email, 'with user type:', userType)
    try {
      console.log('AuthContext: Making request to Supabase...')
      const response = await enhancedSupabase.auth.signUp({
        email,
        password,
      })
      console.log('AuthContext: Sign up response:', response)
      
      if (response.error) {
        return { error: response.error }
      }

      // If signup successful, save user type to auth metadata
      if (response.data.user) {
        const { error: updateError } = await enhancedSupabase.auth.updateUser({
          data: { user_type: userType }
        })
        
        if (updateError) {
          console.error('AuthContext: Error updating user metadata:', updateError)
        }
      }

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


  const handleOAuthSignIn = async (user: User) => {
    try {
      // Check if user has auth_table entry
      const { data: authData, error: authError } = await enhancedSupabase
        .from('auth_table')
        .select('user_type')
        .eq('user_id', user.id)
        .single()
      
      if (authError || !authData) {
        // No auth_table entry, this might be a new OAuth user
        // Check if they have any profile
        const { data: artistProfile } = await enhancedSupabase
          .from('artist_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        const { data: promoterProfile } = await enhancedSupabase
          .from('promoter_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        if (!artistProfile && !promoterProfile) {
          // No profile exists, trigger profile setup
          setTimeout(() => {
            const profileSetupEvent = new CustomEvent('startProfileSetup')
            window.dispatchEvent(profileSetupEvent)
          }, 500)
        } else {
          // Profile exists, show profile
          setTimeout(() => {
            const showProfileEvent = new CustomEvent('showProfile')
            window.dispatchEvent(showProfileEvent)
          }, 500)
        }
      } else {
        // User has auth_table entry, check if they have a profile
        checkUserProfileAndRedirect(user.id)
      }
    } catch (error) {
      console.error('Error handling OAuth sign in:', error)
    }
  }

  const checkUserProfileAndRedirect = async (userId: string) => {
    try {
      // Get user type from auth_table
      const { data: authData } = await enhancedSupabase
        .from('auth_table')
        .select('user_type')
        .eq('user_id', userId)
        .single()
      
      const userType = authData?.user_type
      
      // Check both profile tables
      const { data: artistProfile } = await enhancedSupabase
        .from('artist_profiles')
        .select('id')
        .eq('user_id', userId)
        .single()
      
      const { data: promoterProfile } = await enhancedSupabase
        .from('promoter_profiles')
        .select('id')
        .eq('user_id', userId)
        .single()
      
      if (!artistProfile && !promoterProfile) {
        // No profile found, trigger appropriate profile setup based on user type
        console.log('AuthContext: No profile found, triggering profile setup')
        setTimeout(() => {
          if (userType === 'promoter') {
            const profileSetupEvent = new CustomEvent('startPromoterProfileSetup')
            window.dispatchEvent(profileSetupEvent)
          } else {
            const profileSetupEvent = new CustomEvent('startProfileSetup')
            window.dispatchEvent(profileSetupEvent)
          }
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
      console.error('AuthContext: Error checking user profile and redirect:', error)
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