import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';

// Check if Stripe key is available and valid
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export interface WalletTransaction {
  id: string;
  transaction_type: 'credit' | 'debit';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  reference_type?: string;
  reference_id?: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWallet();
    }
  }, [user]);

  const fetchWallet = async () => {
    if (!user || !supabase) return;

    try {
      setLoading(true);
      
      // First, try to get existing wallet
      let { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('currency', 'INR')
        .maybeSingle(); // Use maybeSingle instead of single to handle 0 rows gracefully

      if (walletError) {
        throw walletError;
      }

      // If no wallet exists, try to create one
      if (!walletData) {
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({
            user_id: user.id,
            balance: 0,
            currency: 'INR'
          })
          .select()
          .single();

        if (createError) {
          // If creation failed due to duplicate key (race condition), try to fetch again
          if (createError.code === '23505') {
            const { data: existingWallet, error: refetchError } = await supabase
              .from('wallets')
              .select('*')
              .eq('user_id', user.id)
              .eq('currency', 'INR')
              .single();

            if (refetchError) throw refetchError;
            walletData = existingWallet;
          } else {
            throw createError;
          }
        } else {
          walletData = newWallet;
        }
      }

      setWallet(walletData);

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const addFunds = async (amount: number) => {
    if (!user || !supabase) {
      throw new Error('User not authenticated');
    }

    if (!stripePromise) {
      throw new Error('Stripe is not configured. Please check your environment variables.');
    }

    try {
      setLoading(true);

      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      // Create payment intent via Supabase Edge Function
      console.log('Creating payment intent for wallet funding...');
      const response = await supabase.functions.invoke('add-wallet-funds', {
        body: { amount, currency: 'inr' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        console.error('Error creating payment intent:', response.error);
        throw new Error(response.error.message || 'Failed to create payment intent');
      }

      const { clientSecret } = response.data;
      if (!clientSecret) {
        throw new Error('No client secret returned from server');
      }

      // Load Stripe
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Failed to load Stripe');

      // Show Stripe payment sheet
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            token: 'tok_visa', // Use test token for development
          },
          billing_details: {
            name: user.user_metadata?.name || user.email || 'User',
            email: user.email,
          },
        },
      });
      
      if (paymentError) {
        console.error('Payment error:', paymentError);
        throw new Error(paymentError.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded') {
        console.log('Payment succeeded, processing wallet credit...');
        
        // Process wallet credit via Edge Function
        const processResponse = await supabase.functions.invoke('process-wallet-payment', {
          body: { 
            paymentIntentId: paymentIntent.id, 
            amount 
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (processResponse.error) {
          console.error('Error processing wallet payment:', processResponse.error);
          throw new Error(processResponse.error.message || 'Failed to process payment');
        }

        // Refresh wallet data
        await fetchWallet();
        return processResponse.data;
      } else {
        throw new Error('Payment not completed');
      }
    } catch (error: any) {
      console.error('Add funds error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const repayLoan = async (loanId: string, repaymentAmount: number) => {
    if (!user || !supabase) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await supabase.functions.invoke('repay-loan', {
        body: { loanId, repaymentAmount },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw new Error(response.error.message || 'Failed to repay loan');

      // Refresh wallet data
      await fetchWallet();
      return response.data;
    } catch (error: any) {
      console.error('Loan repayment error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    wallet,
    transactions,
    loading,
    addFunds,
    repayLoan,
    refetch: fetchWallet,
    stripeConfigured: !!stripePromise
  };
}