import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { LoanRequest } from '../types'
import { useStore } from '../store/useStore'
import { useAuth } from './useAuth'
import { mockLoanRequests } from '../utils/mockData'

export function useLoans() {
  const [loading, setLoading] = useState(true)
  const { loanRequests, setLoanRequests } = useStore()
  const { user } = useAuth()

  useEffect(() => {
    // Only fetch loans once when component mounts
    let mounted = true
    
    const fetchLoansWithDelay = async () => {
      // Add a small delay to ensure auth is settled
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (mounted) {
        await fetchLoans()
      }
    }

    fetchLoansWithDelay()

    return () => {
      mounted = false
    }
  }, []) // Remove dependencies to prevent refetching

  const fetchLoans = async () => {
    try {
      console.log('📋 Fetching loans...')
      setLoading(true)
      
      // If Supabase is not available, use mock data
      if (!supabase) {
        console.log('🎭 Using mock loan data (Supabase not available)')
        setLoanRequests(mockLoanRequests)
        setLoading(false)
        return
      }
      
      const { data, error } = await supabase
        .from('loan_requests')
        .select(`
          *,
          profiles!borrower_id (
            id,
            name,
            email,
            avatar_url,
            is_verified
          ),
          loan_fundings (
            id,
            amount,
            funded_at,
            profiles!lender_id (
              id,
              name,
              avatar_url
            )
          ),
          loan_interactions (
            id,
            type,
            content,
            created_at,
            profiles!user_id (
              id,
              name,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20) // Limit to prevent long loading times

      if (error) {
        console.error('❌ Supabase error fetching loans:', error)
        // Use mock data as fallback
        console.log('🎭 Using mock loan data as fallback')
        setLoanRequests(mockLoanRequests)
        setLoading(false)
        return
      }

      console.log('✅ Loans fetched from Supabase:', data?.length || 0)

      const formattedLoans: LoanRequest[] = (data || []).map((loan: any) => {
        // Get borrower profile data with proper fallbacks
        const borrowerProfile = loan.profiles || {}
        
        return {
          id: loan.id,
          borrowerId: loan.borrower_id,
          borrower: {
            id: borrowerProfile.id || loan.borrower_id,
            name: borrowerProfile.name || 'Student User',
            email: borrowerProfile.email || 'user@example.com',
            avatar: borrowerProfile.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            isVerified: borrowerProfile.is_verified || false,
            badges: [],
            stats: {
              totalLoansGiven: 0,
              totalLoansTaken: 0,
              successfulRepayments: 0,
              averageRating: 0,
              totalAmountLent: 0,
              totalAmountBorrowed: 0
            },
            createdAt: new Date(),
            language: 'en',
            accessibilitySettings: {
              voiceNavigation: false,
              highContrast: false,
              screenReader: false,
              fontSize: 'medium'
            }
          },
          title: loan.title,
          description: loan.description,
          amount: loan.amount,
          currency: loan.currency || 'INR',
          interestRate: loan.interest_rate,
          tenure: loan.tenure_days,
          purpose: loan.purpose,
          status: loan.status,
          fundingProgress: loan.amount > 0 ? (loan.total_funded / loan.amount) * 100 : 0,
          totalFunded: loan.total_funded || 0,
          lenders: (loan.loan_fundings || []).map((funding: any) => ({
            id: funding.id,
            user: {
              id: funding.profiles?.id || '',
              name: funding.profiles?.name || 'Anonymous Lender',
              avatar: funding.profiles?.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
            },
            amount: funding.amount,
            fundedAt: new Date(funding.funded_at)
          })),
          createdAt: new Date(loan.created_at),
          images: loan.images || [],
          medicalVerification: loan.medical_verification,
          likes: (loan.loan_interactions || []).filter((i: any) => i.type === 'like').length,
          comments: (loan.loan_interactions || [])
            .filter((i: any) => i.type === 'comment')
            .map((comment: any) => ({
              id: comment.id,
              userId: comment.profiles?.id || '',
              user: {
                id: comment.profiles?.id || '',
                name: comment.profiles?.name || 'Anonymous',
                avatar: comment.profiles?.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
              },
              content: comment.content,
              createdAt: new Date(comment.created_at)
            })),
          shares: (loan.loan_interactions || []).filter((i: any) => i.type === 'share').length
        }
      })

      // If no data from Supabase, use mock data
      if (formattedLoans.length === 0) {
        console.log('📝 No loans in database, using mock data')
        setLoanRequests(mockLoanRequests)
      } else {
        setLoanRequests(formattedLoans)
      }
    } catch (error) {
      console.error('❌ Error fetching loans:', error)
      // Use mock data as fallback
      console.log('🎭 Using mock loan data due to error')
      setLoanRequests(mockLoanRequests)
    } finally {
      setLoading(false)
    }
  }

  const createLoan = async (loanData: {
    title: string
    description: string
    amount: number
    interestRate: number
    tenureDays: number
    purpose: string
    images?: string[]
  }) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to create a loan')
      }

      if (!supabase) {
        throw new Error('Database service not available. Please check your connection.')
      }

      console.log('📝 Creating loan with data:', loanData)
      console.log('👤 Current user:', user.id)

      const { data, error } = await supabase
        .from('loan_requests')
        .insert({
          borrower_id: user.id,
          title: loanData.title,
          description: loanData.description,
          amount: loanData.amount,
          interest_rate: loanData.interestRate,
          tenure_days: loanData.tenureDays,
          purpose: loanData.purpose,
          images: loanData.images || [],
          status: 'active',
          total_funded: 0,
          currency: 'INR'
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }

      console.log('✅ Loan created successfully:', data)
      await fetchLoans() // Refresh the list
      return { data, error: null }
    } catch (error: any) {
      console.error('❌ Error creating loan:', error)
      return { data: null, error }
    }
  }

  const fundLoan = async (loanId: string, amount: number) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to fund a loan')
      }

      if (!supabase) {
        throw new Error('Database service not available. Please check your connection.')
      }

      console.log('💰 Funding loan:', loanId, 'Amount:', amount)

      const { data, error } = await supabase
        .from('loan_fundings')
        .insert({
          loan_id: loanId,
          lender_id: user.id,
          amount
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Funding error:', error)
        throw error
      }

      console.log('✅ Loan funded successfully:', data)
      await fetchLoans() // Refresh the list
      return { data, error: null }
    } catch (error: any) {
      console.error('❌ Error funding loan:', error)
      return { data: null, error }
    }
  }

  const addInteraction = async (loanId: string, type: 'like' | 'comment' | 'share', content?: string) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to interact with loans')
      }

      if (!supabase) {
        throw new Error('Database service not available. Please check your connection.')
      }

      const { data, error } = await supabase
        .from('loan_interactions')
        .insert({
          loan_id: loanId,
          user_id: user.id,
          type,
          content
        })
        .select()
        .single()

      if (error) throw error

      await fetchLoans() // Refresh the list
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  return {
    loans: loanRequests,
    loading,
    createLoan,
    fundLoan,
    addInteraction,
    refetch: fetchLoans
  }
}