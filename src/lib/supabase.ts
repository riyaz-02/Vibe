import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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