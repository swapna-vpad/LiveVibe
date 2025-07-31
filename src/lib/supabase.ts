import { createClient } from '@supabase/supabase-js'

// Check if we're in development mode and environment variables are missing
const isDevelopment = import.meta.env.DEV
const hasValidConfig = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase client configured with real credentials

// Create the real Supabase client with your credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rkvmxyufjmbknldbplub.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrdm14eXVmam1ia25sZGJwbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTU1MjUsImV4cCI6MjA2NjQ3MTUyNX0.codnJhEOt1ZJekf7FTaAXAKOD4N697xUoutgMV_Bqtk'

console.log('✅ Supabase configured with URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'livevibe1-web'
    }
  }
})

// Real Supabase client is now configured

// Export the real Supabase client
export const enhancedSupabase = supabase
export { supabase }

// Database Types (Auto-generated from your schema)
export type Database = {
  public: {
    Tables: {
      artist_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          phone_number: string | null
          city: string | null
          state: string | null
          country: string | null
          travel_distance: number | null
          profile_photo_url: string | null
          instagram: string | null
          tiktok: string | null
          pinterest: string | null
          youtube: string | null
          behance: string | null
          facebook: string | null
          linkedin: string | null
          spotify: string | null
          artist_type: string | null
          visual_artist_category: string | null
          performing_artist_type: string | null
          music_genres: string[] | null
          instruments: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phone_number?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          travel_distance?: number | null
          profile_photo_url?: string | null
          instagram?: string | null
          tiktok?: string | null
          pinterest?: string | null
          youtube?: string | null
          behance?: string | null
          facebook?: string | null
          linkedin?: string | null
          spotify?: string | null
          artist_type?: string | null
          visual_artist_category?: string | null
          performing_artist_type?: string | null
          music_genres?: string[] | null
          instruments?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone_number?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          travel_distance?: number | null
          profile_photo_url?: string | null
          instagram?: string | null
          tiktok?: string | null
          pinterest?: string | null
          youtube?: string | null
          behance?: string | null
          facebook?: string | null
          linkedin?: string | null
          spotify?: string | null
          artist_type?: string | null
          visual_artist_category?: string | null
          performing_artist_type?: string | null
          music_genres?: string[] | null
          instruments?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      promoter_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          phone_number: string | null
          city: string | null
          state: string | null
          country: string | null
          number_of_clients: number | null
          profile_photo_url: string | null
          instagram: string | null
          tiktok: string | null
          pinterest: string | null
          youtube: string | null
          behance: string | null
          facebook: string | null
          linkedin: string | null
          spotify: string | null
          promoter_type: string
          subscription_plan: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phone_number?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          number_of_clients?: number | null
          profile_photo_url?: string | null
          instagram?: string | null
          tiktok?: string | null
          pinterest?: string | null
          youtube?: string | null
          behance?: string | null
          facebook?: string | null
          linkedin?: string | null
          spotify?: string | null
          promoter_type: string
          subscription_plan: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone_number?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          number_of_clients?: number | null
          profile_photo_url?: string | null
          instagram?: string | null
          tiktok?: string | null
          pinterest?: string | null
          youtube?: string | null
          behance?: string | null
          facebook?: string | null
          linkedin?: string | null
          spotify?: string | null
          promoter_type?: string
          subscription_plan?: string
          created_at?: string
          updated_at?: string
        }
      }
      art_pieces: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          type: string
          file_url: string
          file_name: string
          file_size: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          type: string
          file_url: string
          file_name: string
          file_size?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          type?: string
          file_url?: string
          file_name?: string
          file_size?: number
          created_at?: string
          updated_at?: string
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          type: string
          tier: string
          price_monthly: number
          price_yearly: number
          features: string[]
          commission_rate: number
          ai_generations: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          tier: string
          price_monthly?: number
          price_yearly?: number
          features?: string[]
          commission_rate?: number
          ai_generations?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          tier?: string
          price_monthly?: number
          price_yearly?: number
          features?: string[]
          commission_rate?: number
          ai_generations?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          billing_cycle: string
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: string
          billing_cycle?: string
          current_period_start?: string
          current_period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          billing_cycle?: string
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      ai_generations_usage: {
        Row: {
          id: string
          user_id: string
          month_year: string
          generations_used: number
          plan_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month_year: string
          generations_used?: number
          plan_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month_year?: string
          generations_used?: number
          plan_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          organizer_id: string
          title: string
          description: string | null
          event_date: string
          venue_name: string
          venue_address: string | null
          city: string
          state: string | null
          country: string | null
          budget_min: number
          budget_max: number
          event_type: string | null
          duration_hours: number
          audience_size: number
          required_genres: string[]
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizer_id: string
          title: string
          description?: string | null
          event_date: string
          venue_name: string
          venue_address?: string | null
          city: string
          state?: string | null
          country?: string | null
          budget_min?: number
          budget_max?: number
          event_type?: string | null
          duration_hours?: number
          audience_size?: number
          required_genres?: string[]
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizer_id?: string
          title?: string
          description?: string | null
          event_date?: string
          venue_name?: string
          venue_address?: string | null
          city?: string
          state?: string | null
          country?: string | null
          budget_min?: number
          budget_max?: number
          event_type?: string | null
          duration_hours?: number
          audience_size?: number
          required_genres?: string[]
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          event_id: string
          artist_id: string
          organizer_id: string
          status: string
          proposed_fee: number
          final_fee: number
          message: string | null
          contract_terms: string | null
          payment_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          artist_id: string
          organizer_id: string
          status?: string
          proposed_fee: number
          final_fee?: number
          message?: string | null
          contract_terms?: string | null
          payment_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          artist_id?: string
          organizer_id?: string
          status?: string
          proposed_fee?: number
          final_fee?: number
          message?: string | null
          contract_terms?: string | null
          payment_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      artist_availability: {
        Row: {
          id: string
          artist_id: string
          date: string
          start_time: string | null
          end_time: string | null
          is_available: boolean
          booking_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          date: string
          start_time?: string | null
          end_time?: string | null
          is_available?: boolean
          booking_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          date?: string
          start_time?: string | null
          end_time?: string | null
          is_available?: boolean
          booking_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: any
          read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: any
          read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: any
          read?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper functions for common operations
export const supabaseHelpers = {
  // Authentication helpers
  async signUp(email: string, password: string) {
    return await enhancedSupabase.auth.signUp({ email, password })
  },

  async signIn(email: string, password: string) {
    return await enhancedSupabase.auth.signInWithPassword({ email, password })
  },

  async signOut() {
    return await enhancedSupabase.auth.signOut()
  },

  async getCurrentUser() {
    const { data: { user } } = await enhancedSupabase.auth.getUser()
    return user
  },

  // Artist profile helpers
  async getArtistProfile(userId: string) {
    return await enhancedSupabase
      .from('artist_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
  },

  async createArtistProfile(profile: Database['public']['Tables']['artist_profiles']['Insert']) {
    return await enhancedSupabase
      .from('artist_profiles')
      .insert(profile)
      .select()
      .single()
  },

  async updateArtistProfile(userId: string, updates: Database['public']['Tables']['artist_profiles']['Update']) {
    return await enhancedSupabase
      .from('artist_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
  },

  // Art pieces helpers
  async getArtPieces(userId: string) {
    return await enhancedSupabase
      .from('art_pieces')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  async uploadArtPiece(artPiece: Database['public']['Tables']['art_pieces']['Insert']) {
    return await enhancedSupabase
      .from('art_pieces')
      .insert(artPiece)
      .select()
      .single()
  },

  // Events helpers
  async getEvents(organizerId?: string) {
    let query = enhancedSupabase.from('events').select('*')
    
    if (organizerId) {
      query = query.eq('organizer_id', organizerId)
    }
    
    return await query.order('event_date', { ascending: true })
  },

  async createEvent(event: Database['public']['Tables']['events']['Insert']) {
    return await enhancedSupabase
      .from('events')
      .insert(event)
      .select()
      .single()
  },

  // Bookings helpers
  async getBookings(userId: string, userType: 'artist' | 'organizer') {
    const column = userType === 'artist' ? 'artist_id' : 'organizer_id'
    
    return await enhancedSupabase
      .from('bookings')
      .select(`
        *,
        event:events(*),
        artist:artist_profiles(*)
      `)
      .eq(column, userId)
      .order('created_at', { ascending: false })
  },

  async createBooking(booking: Database['public']['Tables']['bookings']['Insert']) {
    return await enhancedSupabase
      .from('bookings')
      .insert(booking)
      .select()
      .single()
  },

  // Storage helpers
  async uploadFile(bucket: string, path: string, file: File) {
    return await enhancedSupabase.storage
      .from(bucket)
      .upload(path, file)
  },

  async getPublicUrl(bucket: string, path: string) {
    return enhancedSupabase.storage
      .from(bucket)
      .getPublicUrl(path)
  },

  // Subscription helpers
  async getSubscriptionPlans() {
    return await enhancedSupabase
      .from('subscription_plans')
      .select('*')
      .eq('active', true)
      .order('price_monthly', { ascending: true })
  },

  async getUserSubscription(userId: string) {
    return await enhancedSupabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
  }
}