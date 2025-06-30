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

  const createUserProfile = useCallback(async (authUser: User) => {
    if (!supabase) return null;

    try {
      console.log('📝 Creating user profile for:', authUser.id);
      
      const profileData = {
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        phone: authUser.user_metadata?.phone || null,
        avatar_url: authUser.user_metadata?.avatar_url || null,
        is_verified: false,
        language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: profile, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        // If profile already exists (race condition), fetch it
        if (error.code === '23505') {
          console.log('📋 Profile already exists, fetching...');
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
          
          if (fetchError) throw fetchError;
          return existingProfile;
        }
        throw error;
      }

      console.log('✅ Profile created successfully:', profile.name);
      return profile;
    } catch (error: any) {
      console.error('❌ Error creating profile:', error.message);
      throw error;
    }
  }, []);

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

      // Use maybeSingle() to handle cases where profile doesn't exist
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_stats(*),
          accessibility_settings(*),
          badges(*)
        `)
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('❌ Profile fetch error:', error.message)
        return
      }

      // If no profile exists, create one
      if (!profile) {
        console.log('📝 No profile found, creating new profile...');
        
        // Get the current user to create profile
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          console.error('❌ No authenticated user found');
          return;
        }

        const newProfile = await createUserProfile(authUser);
        if (!newProfile) return;

        // Set the new profile data
        setCurrentUser({
          id: newProfile.id,
          name: newProfile.name,
          email: newProfile.email,
          avatar: newProfile.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          isVerified: newProfile.is_verified || false,
          badges: [],
          stats: {
            totalLoansGiven: 0,
            totalLoansTaken: 0,
            successfulRepayments: 0,
            averageRating: 0,
            totalAmountLent: 0,
            totalAmountBorrowed: 0
          },
          createdAt: new Date(newProfile.created_at),
          language: newProfile.language || 'en',
          accessibilitySettings: {
            voiceNavigation: false,
            highContrast: false,
            screenReader: false,
            fontSize: 'medium'
          }
        });
        return;
      }

      // Fetch loan statistics
      const { data: loanFundings } = await supabase
        .from('loan_fundings')
        .select('amount')
        .eq('lender_id', userId);

      const { data: loanRequests } = await supabase
        .from('loan_requests')
        .select('amount, status')
        .eq('borrower_id', userId);

      // Calculate stats
      const totalAmountLent = loanFundings?.reduce((sum, funding) => sum + Number(funding.amount), 0) || 0;
      const totalAmountBorrowed = loanRequests?.reduce((sum, request) => sum + Number(request.amount), 0) || 0;
      const totalLoansGiven = loanFundings?.length || 0;
      const totalLoansTaken = loanRequests?.length || 0;
      const successfulRepayments = loanRequests?.filter(req => req.status === 'completed').length || 0;

      // Check and award badges (with error handling)
      try {
        await checkAndAwardBadges(userId, {
          totalLoansGiven,
          totalLoansTaken,
          successfulRepayments,
          isVerified: profile?.is_verified || false
        });
      } catch (badgeError) {
        console.error('Error awarding badges:', badgeError);
        // Continue with profile loading even if badge awarding fails
      }

      const formattedProfile = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        avatar: profile.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        isVerified: profile.is_verified || false,
        badges: profile.badges || [],
        stats: {
          totalLoansGiven,
          totalLoansTaken,
          successfulRepayments,
          averageRating: profile.user_stats?.average_rating || 0,
          totalAmountLent,
          totalAmountBorrowed
        },
        createdAt: new Date(profile.created_at),
        language: profile.language || 'en',
        accessibilitySettings: profile.accessibility_settings || {
          voiceNavigation: false,
          highContrast: false,
          screenReader: false,
          fontSize: 'medium'
        }
      };

      setCurrentUser(formattedProfile);
      console.log('✅ Profile loaded:', profile.name);

    } catch (error: any) {
      console.error('❌ Error fetching user profile:', error.message)
    }
  }, [setCurrentUser, createUserProfile])

  const checkAndAwardBadges = async (userId: string, stats: any) => {
    try {
      if (!supabase) return;

      // First, fetch existing badges for the user
      const { data: existingBadges, error: fetchError } = await supabase
        .from('badges')
        .select('name')
        .eq('user_id', userId);

      if (fetchError) {
        console.error('Error fetching existing badges:', fetchError);
        return;
      }

      const existingBadgeNames = new Set(existingBadges?.map(badge => badge.name) || []);

      const badgesToAward = [];

      // Check for verified member badge
      if (stats.isVerified && !existingBadgeNames.has('Verified Member')) {
        badgesToAward.push({
          user_id: userId,
          name: 'Verified Member',
          description: 'Completed identity verification',
          icon: '✅',
          category: 'community'
        });
      }

      // Only insert badges that don't already exist
      if (badgesToAward.length > 0) {
        const { error } = await supabase
          .from('badges')
          .insert(badgesToAward);

        if (error) {
          console.error('Error inserting badges:', error);
        }
      }
    } catch (error) {
      console.error('Error in checkAndAwardBadges:', error);
      // Don't throw error to prevent breaking the profile loading
    }
  };

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