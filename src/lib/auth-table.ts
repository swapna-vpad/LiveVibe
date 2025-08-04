import { enhancedSupabase } from './supabase'

export interface AuthTableUser {
  id: number
  user_name: string
  email: string
  module: string
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface SignUpData {
  user_name: string
  email: string
  password: string
  module?: string
}

export interface SignInData {
  email_or_username: string
  password: string
}

export class AuthTableService {
  // Sign up a new user
  static async signUp(data: SignUpData): Promise<{ user?: AuthTableUser; error?: any }> {
    try {
      console.log('AuthTable: Attempting signup for:', data.email)

      // Check if user already exists
      const { data: existingUser, error: checkError } = await enhancedSupabase
        .from('auth_table')
        .select('id, email, user_name')
        .or(`email.eq.${data.email},user_name.eq.${data.user_name}`)
        .single()

      if (existingUser) {
        return {
          error: {
            message: existingUser.email === data.email 
              ? 'An account with this email already exists' 
              : 'This username is already taken'
          }
        }
      }

      // Hash password using database function
      const { data: hashedResult, error: hashError } = await enhancedSupabase
        .rpc('hash_password', { password_text: data.password })

      if (hashError) {
        console.error('Password hashing failed:', hashError)
        return { error: { message: 'Failed to process password' } }
      }

      // Insert new user
      const { data: newUser, error: insertError } = await enhancedSupabase
        .from('auth_table')
        .insert({
          user_name: data.user_name,
          email: data.email,
          password: hashedResult,
          module: data.module || 'artist'
        })
        .select()
        .single()

      if (insertError) {
        console.error('User insertion failed:', insertError)
        return { error: { message: 'Failed to create account' } }
      }

      console.log('AuthTable: User created successfully:', newUser.id)
      return { user: newUser }

    } catch (error: any) {
      console.error('AuthTable signup error:', error)
      return { error: { message: error.message || 'Signup failed' } }
    }
  }

  // Sign in an existing user
  static async signIn(data: SignInData): Promise<{ user?: AuthTableUser; error?: any }> {
    try {
      console.log('AuthTable: Attempting signin for:', data.email_or_username)

      // Use database function to authenticate
      const { data: authResult, error: authError } = await enhancedSupabase
        .rpc('authenticate_user', {
          email_or_username: data.email_or_username,
          password_text: data.password
        })

      if (authError) {
        console.error('Authentication error:', authError)
        return { error: { message: 'Authentication failed' } }
      }

      if (!authResult || authResult.length === 0) {
        return { error: { message: 'Invalid email/username or password' } }
      }

      const user = authResult[0]
      console.log('AuthTable: User authenticated successfully:', user.id)
      return { user }

    } catch (error: any) {
      console.error('AuthTable signin error:', error)
      return { error: { message: error.message || 'Signin failed' } }
    }
  }

  // Get user by ID
  static async getUserById(id: number): Promise<{ user?: AuthTableUser; error?: any }> {
    try {
      const { data: user, error } = await enhancedSupabase
        .from('auth_table')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) {
        return { error }
      }

      return { user }
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to get user' } }
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<{ user?: AuthTableUser; error?: any }> {
    try {
      const { data: user, error } = await enhancedSupabase
        .from('auth_table')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (error) {
        return { error }
      }

      return { user }
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to get user' } }
    }
  }

  // Update user
  static async updateUser(id: number, updates: Partial<AuthTableUser>): Promise<{ user?: AuthTableUser; error?: any }> {
    try {
      const { data: user, error } = await enhancedSupabase
        .from('auth_table')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { error }
      }

      return { user }
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to update user' } }
    }
  }

  // Deactivate user (soft delete)
  static async deactivateUser(id: number): Promise<{ error?: any }> {
    try {
      const { error } = await enhancedSupabase
        .from('auth_table')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        return { error }
      }

      return {}
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to deactivate user' } }
    }
  }
}