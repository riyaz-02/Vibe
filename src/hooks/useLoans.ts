import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { LoanRequest } from '../types'
import { useStore } from '../store/useStore'
import { useAuth } from './useAuth'

export function useLoans() {
  const [loading, setLoading] = useState(true)
  const { loanRequests, setLoanRequests } = useStore()
  const { user } = useAuth()

  useEffect(() => {
    fetchLoans()
  }, [])

  const fetchLoans = async () => {
    try {
      setLoading(true)
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

      if (error) throw error

      const formattedLoans: LoanRequest[] = data.map((loan: any) => ({
        id: loan.id,
        borrowerId: loan.borrower_id,
        borrower: {
          id: loan.profiles.id,
          name: loan.profiles.name,
          email: loan.profiles.email,
          avatar: loan.profiles.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          isVerified: loan.profiles.is_verified,
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
        currency: loan.currency,
        interestRate: loan.interest_rate,
        tenure: loan.tenure_days,
        purpose: loan.purpose,
        status: loan.status,
        fundingProgress: loan.amount > 0 ? (loan.total_funded / loan.amount) * 100 : 0,
        totalFunded: loan.total_funded,
        lenders: loan.loan_fundings.map((funding: any) => ({
          id: funding.id,
          user: {
            id: funding.profiles.id,
            name: funding.profiles.name,
            avatar: funding.profiles.avatar_url
          },
          amount: funding.amount,
          fundedAt: new Date(funding.funded_at)
        })),
        createdAt: new Date(loan.created_at),
        images: loan.images || [],
        medicalVerification: loan.medical_verification,
        likes: loan.loan_interactions.filter((i: any) => i.type === 'like').length,
        comments: loan.loan_interactions
          .filter((i: any) => i.type === 'comment')
          .map((comment: any) => ({
            id: comment.id,
            userId: comment.profiles.id,
            user: {
              id: comment.profiles.id,
              name: comment.profiles.name,
              avatar: comment.profiles.avatar_url
            },
            content: comment.content,
            createdAt: new Date(comment.created_at)
          })),
        shares: loan.loan_interactions.filter((i: any) => i.type === 'share').length
      }))

      setLoanRequests(formattedLoans)
    } catch (error) {
      console.error('Error fetching loans:', error)
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

      console.log('Creating loan with data:', loanData)
      console.log('Current user:', user.id)

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
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Loan created successfully:', data)
      await fetchLoans() // Refresh the list
      return { data, error: null }
    } catch (error: any) {
      console.error('Error creating loan:', error)
      return { data: null, error }
    }
  }

  const fundLoan = async (loanId: string, amount: number) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to fund a loan')
      }

      const { data, error } = await supabase
        .from('loan_fundings')
        .insert({
          loan_id: loanId,
          lender_id: user.id,
          amount
        })
        .select()
        .single()

      if (error) throw error

      await fetchLoans() // Refresh the list
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const addInteraction = async (loanId: string, type: 'like' | 'comment' | 'share', content?: string) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to interact with loans')
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
    } catch (error) {
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