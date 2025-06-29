import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are properly set
const hasValidConfig = supabaseUrl && 
                      supabaseAnonKey && 
                      supabaseUrl !== 'your_supabase_project_url_here' &&
                      supabaseAnonKey !== 'your_supabase_anon_key_here' &&
                      supabaseUrl.startsWith('https://') &&
                      supabaseAnonKey.length > 50

if (!hasValidConfig) {
  console.warn('⚠️ Supabase configuration missing or invalid')
  console.log('📝 To enable full functionality:')
  console.log('1. Create a Supabase project at https://supabase.com')
  console.log('2. Get your project URL and anon key from Settings > API')
  console.log('3. Update the .env file with your credentials')
  console.log('4. Restart the development server')
  console.log('')
  console.log('🎯 Current status: Running in demo mode with mock data')
}

// Only create client if we have valid environment variables
export const supabase = hasValidConfig 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 2
        }
      }
    })
  : null

// Test connection only if client exists and we're not in demo mode
if (supabase && hasValidConfig) {
  // Test connection with a simple query
  supabase.from('profiles').select('count', { count: 'exact', head: true })
    .then(({ error, count }) => {
      if (error) {
        console.error('❌ Supabase connection test failed:', error.message)
        console.log('💡 Check your database setup and RLS policies')
      } else {
        console.log('✅ Supabase connected successfully')
        console.log(`📊 Database ready (${count || 0} profiles)`)
      }
    })
    .catch(err => {
      console.error('❌ Supabase connection error:', err.message)
    })
}

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url?: string
          is_verified: boolean
          phone?: string
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          avatar_url?: string
          is_verified?: boolean
          phone?: string
          language?: string
        }
        Update: {
          name?: string
          email?: string
          avatar_url?: string
          is_verified?: boolean
          phone?: string
          language?: string
        }
      }
      loan_requests: {
        Row: {
          id: string
          borrower_id: string
          title: string
          description: string
          amount: number
          currency: string
          interest_rate: number
          tenure_days: number
          purpose: string
          status: string
          total_funded: number
          images?: string[]
          medical_verification?: any
          created_at: string
          updated_at: string
        }
        Insert: {
          borrower_id: string
          title: string
          description: string
          amount: number
          currency?: string
          interest_rate: number
          tenure_days: number
          purpose: string
          images?: string[]
          medical_verification?: any
        }
        Update: {
          title?: string
          description?: string
          amount?: number
          interest_rate?: number
          tenure_days?: number
          purpose?: string
          status?: string
          images?: string[]
          medical_verification?: any
        }
      }
      loan_fundings: {
        Row: {
          id: string
          loan_id: string
          lender_id: string
          amount: number
          funded_at: string
        }
        Insert: {
          loan_id: string
          lender_id: string
          amount: number
        }
        Update: {
          amount?: number
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
        }
        Update: {
          is_read?: boolean
        }
      }
    }
  }
}