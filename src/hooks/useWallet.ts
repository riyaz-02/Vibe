import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

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

  const fetchWallet = async () => {
    if (!user || !supabase) return;

    try {
      setLoading(true);
      
      // Get or create wallet
      let { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('currency', 'INR')
        .single();

      if (walletError && walletError.code === 'PGRST116') {
        // Create wallet if doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({
            user_id: user.id,
            balance: 0,
            currency: 'INR'
          })
          .select()
          .single();

        if (createError) throw createError;
        walletData = newWallet;
      } else if (walletError) {
        throw walletError;
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
    } finally {
      setLoading(false);
    }
  };

  const addFunds = async (amount: number) => {
    if (!user || !supabase) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);

      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      // Create payment intent
      const response = await supabase.functions.invoke('add-wallet-funds', {
        body: { amount, currency: 'inr' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      const { clientSecret } = response.data;
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');

      // Confirm payment
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret);
      
      if (paymentError) throw paymentError;

      if (paymentIntent?.status === 'succeeded') {
        // Process wallet credit
        const processResponse = await supabase.functions.invoke('process-wallet-payment', {
          body: { 
            paymentIntentId: paymentIntent.id, 
            amount 
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (processResponse.error) throw processResponse.error;

        // Refresh wallet data
        await fetchWallet();
        return processResponse.data;
      }

      throw new Error('Payment not completed');
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

      if (response.error) throw response.error;

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

  useEffect(() => {
    if (user) {
      fetchWallet();
    }
  }, [user]);

  return {
    wallet,
    transactions,
    loading,
    addFunds,
    repayLoan,
    refetch: fetchWallet
  };
}