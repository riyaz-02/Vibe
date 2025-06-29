import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { setCurrentUser, setAuthenticated } = useStore()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthenticated(!!session?.user)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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

    return () => subscription.unsubscribe()
  }, [setCurrentUser, setAuthenticated])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          *,
          user_stats(*),
          accessibility_settings(*),
          badges(*)
        `)
        .eq('id', userId)
        .single()

      if (profile) {
        setCurrentUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar_url,
          isVerified: profile.is_verified,
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
          language: profile.language,
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
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
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
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }
}