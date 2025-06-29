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
    let timeoutId: NodeJS.Timeout | null = null

    const initializeAuth = async () => {
      try {
        // Check if Supabase client is available
        if (!supabase) {
          console.log('🎯 Running in demo mode - Supabase not configured')
          if (mounted) {
            setUser(null)
            setAuthenticated(false)
            setCurrentUser(null)
            setLoading(false)
          }
          return
        }

        console.log('🔐 Initializing authentication...')
        
        // Set a much longer timeout to prevent hanging
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('⏰ Auth initialization timeout - continuing in demo mode')
            setUser(null)
            setAuthenticated(false)
            setCurrentUser(null)
            setLoading(false)
          }
        }, 30000) // Increased to 30 seconds

        // Get initial session with extended timeout
        const sessionPromise = supabase.auth.getSession()
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error('Session timeout')), 25000) // Increased to 25 seconds
          )
        ])

        // Clear timeout if we get a response
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        if (error) {
          console.error('❌ Session error:', error.message)
          if (mounted) {
            setUser(null)
            setAuthenticated(false)
            setCurrentUser(null)
            setLoading(false)
          }
          return
        }

        if (!mounted) return

        console.log(session?.user ? '✅ User session found' : '👤 No active session')
        setUser(session?.user ?? null)
        setAuthenticated(!!session?.user)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
        
        setLoading(false)
      } catch (error: any) {
        console.error('❌ Auth initialization failed:', error.message)
        
        // Clear timeout on error
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        
        // Continue without authentication
        if (mounted) {
          setUser(null)
          setAuthenticated(false)
          setCurrentUser(null)
          setLoading(false)
        }
      }
    }

    // Initialize auth immediately
    initializeAuth()

    // Listen for auth changes only if Supabase client is available
    let subscription: any = null
    if (supabase) {
      try {
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return
            
            console.log('🔄 Auth state changed:', event)
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
      } catch (error: any) {
        console.error('❌ Failed to set up auth listener:', error.message)
      }
    }

    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [setCurrentUser, setAuthenticated])

  const fetchUserProfile = async (userId: string) => {
    try {
      if (!supabase) {
        console.error('❌ Supabase client not available')
        return
      }

      console.log('👤 Fetching user profile...')
      
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
        console.error('❌ Profile fetch error:', error.message)
        // Create a basic profile if it doesn't exist
        if (error.code === 'PGRST116') {
          console.log('📝 Profile not found - user can create one later')
          return
        }
        return
      }

      if (profile) {
        console.log('✅ Profile loaded:', profile.name)
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
    } catch (error: any) {
      console.error('❌ Error fetching user profile:', error.message)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      if (!supabase) {
        return { 
          data: null, 
          error: new Error('Authentication service not available. Please check your Supabase configuration.') 
        }
      }

      console.log('📝 Creating new account...')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })
      
      if (error) {
        console.error('❌ Sign up error:', error.message)
      } else {
        console.log('✅ Account created successfully')
      }
      
      return { data, error }
    } catch (error: any) {
      console.error('❌ Sign up error:', error.message)
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      if (!supabase) {
        return { 
          data: null, 
          error: new Error('Authentication service not available. Please check your Supabase configuration.') 
        }
      }

      console.log('🔑 Signing in...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('❌ Sign in error:', error.message)
      } else {
        console.log('✅ Signed in successfully')
      }
      
      return { data, error }
    } catch (error: any) {
      console.error('❌ Sign in error:', error.message)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      if (!supabase) {
        return { error: new Error('Authentication service not available') }
      }

      console.log('👋 Signing out...')
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Sign out error:', error.message)
      } else {
        console.log('✅ Signed out successfully')
      }
      
      return { error }
    } catch (error: any) {
      console.error('❌ Sign out error:', error.message)
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