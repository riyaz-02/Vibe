import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { setCurrentUser, setAuthenticated } = useStore()

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...')
        
        // Check if Supabase client is available
        if (!supabase) {
          console.error('Supabase client not available - check environment variables')
          if (mounted) {
            setUser(null)
            setAuthenticated(false)
            setCurrentUser(null)
            setLoading(false)
          }
          return
        }

        // Get initial session with timeout - reduced to 10 seconds for faster feedback
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout - check Supabase connection')), 10000)
        )

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any

        if (error) {
          console.error('Session error:', error)
          throw error
        }

        if (!mounted) return

        console.log('Session loaded:', !!session?.user)
        setUser(session?.user ?? null)
        setAuthenticated(!!session?.user)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
        // Continue without authentication
        if (mounted) {
          setUser(null)
          setAuthenticated(false)
          setCurrentUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Initialize auth
    initializeAuth()

    // Listen for auth changes only if Supabase client is available
    let subscription: any = null
    if (supabase) {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return
          
          console.log('Auth state changed:', event, !!session?.user)
          setUser(session?.user ?? null)
          setAuthenticated(!!session?.user)
          
          if (session?.user) {
            await fetchUserProfile(session.user.id)
          } else {
            setCurrentUser(null)
          }
          
          setLoading(false)
        }
      )
      subscription = authSubscription
    }

    return () => {
      mounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [setCurrentUser, setAuthenticated])

  const fetchUserProfile = async (userId: string) => {
    try {
      if (!supabase) {
        console.error('Supabase client not available')
        return
      }

      console.log('Fetching user profile for:', userId)
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_stats(*),
          accessibility_settings(*),
          badges(*)
        `)
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
        // Create a basic profile if it doesn't exist
        if (error.code === 'PGRST116') {
          console.log('Profile not found, user can create one later')
          return
        }
        throw error
      }

      if (profile) {
        console.log('Profile loaded:', profile.name)
        setCurrentUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          isVerified: profile.is_verified || false,
          badges: profile.badges || [],
          stats: profile.user_stats || {
            totalLoansGiven: 0,
            totalLoansTaken: 0,
            successfulRepayments: 0,
            averageRating: 0,
            totalAmountLent: 0,
            totalAmountBorrowed: 0
          },
          createdAt: new Date(profile.created_at),
          language: profile.language || 'en',
          accessibilitySettings: profile.accessibility_settings || {
            voiceNavigation: false,
            highContrast: false,
            screenReader: false,
            fontSize: 'medium'
          }
        })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // Don't throw error, just continue without profile
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      if (!supabase) {
        return { data: null, error: new Error('Supabase client not available') }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })
      return { data, error }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      if (!supabase) {
        return { data: null, error: new Error('Supabase client not available') }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      if (!supabase) {
        return { error: new Error('Supabase client not available') }
      }

      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }
}