import { useEffect, useState, useCallback, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { setCurrentUser, setAuthenticated } = useStore()
  
  // Use refs to prevent infinite loops
  const initializationRef = useRef(false)
  const currentUserIdRef = useRef<string | null>(null)
  const profileFetchedRef = useRef(false)

  const fetchUserProfile = useCallback(async (userId: string) => {
    // Prevent multiple fetches for the same user
    if (currentUserIdRef.current === userId && profileFetchedRef.current) {
      return
    }

    try {
      if (!supabase) {
        console.log('🎭 Supabase not available - skipping profile fetch')
        return
      }

      console.log('👤 Fetching user profile for:', userId)
      currentUserIdRef.current = userId
      profileFetchedRef.current = true

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
        if (error.code === 'PGRST116') {
          console.log('📝 Profile not found - user can create one later')
        } else {
          console.error('❌ Profile fetch error:', error.message)
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
  }, [setCurrentUser])

  useEffect(() => {
    let mounted = true
    let authSubscription: any = null

    const initializeAuth = async () => {
      // Prevent multiple initializations
      if (initializationRef.current) {
        return
      }
      initializationRef.current = true

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
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error('❌ Session error:', error.message)
          setUser(null)
          setAuthenticated(false)
          setCurrentUser(null)
          setLoading(false)
          return
        }

        const currentUser = session?.user ?? null
        console.log(currentUser ? '✅ User session found' : '👤 No active session')
        
        setUser(currentUser)
        setAuthenticated(!!currentUser)
        
        if (currentUser) {
          await fetchUserProfile(currentUser.id)
        }
        
        setLoading(false)

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return
            
            console.log('🔄 Auth state changed:', event)
            
            const newUser = session?.user ?? null
            const userChanged = newUser?.id !== currentUserIdRef.current
            
            // Only update if user actually changed
            if (userChanged) {
              setUser(newUser)
              setAuthenticated(!!newUser)
              
              if (newUser) {
                // Reset profile fetch flag for new user
                profileFetchedRef.current = false
                await fetchUserProfile(newUser.id)
              } else {
                // Clear user data
                currentUserIdRef.current = null
                profileFetchedRef.current = false
                setCurrentUser(null)
              }
            }
            
            setLoading(false)
          }
        )
        
        authSubscription = subscription
      } catch (error: any) {
        console.error('❌ Auth initialization failed:', error.message)
        
        if (mounted) {
          setUser(null)
          setAuthenticated(false)
          setCurrentUser(null)
          setLoading(false)
        }
      }
    }

    // Set a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      if (!initializationRef.current && mounted) {
        console.warn('⏰ Auth initialization timeout - continuing in demo mode')
        setUser(null)
        setAuthenticated(false)
        setCurrentUser(null)
        setLoading(false)
        initializationRef.current = true
      }
    }, 5000) // Reduced to 5 seconds

    // Initialize auth
    initializeAuth()

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
      // Reset refs on cleanup
      initializationRef.current = false
      currentUserIdRef.current = null
      profileFetchedRef.current = false
    }
  }, [fetchUserProfile, setAuthenticated, setCurrentUser])

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
      
      // Clear user data immediately
      setUser(null)
      setAuthenticated(false)
      setCurrentUser(null)
      currentUserIdRef.current = null
      profileFetchedRef.current = false
      
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