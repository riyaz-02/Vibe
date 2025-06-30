import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LoanAgreement } from '../types';
import { useAuth } from './useAuth';
import { PDFGenerator } from '../utils/pdfGenerator';

export function useAgreements() {
  const [agreements, setAgreements] = useState<LoanAgreement[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchAgreements = async () => {
    if (!user || !supabase) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('loan_agreements')
        .select(`
          *,
          loan_requests!inner(title, amount, purpose),
          borrower:profiles!borrower_id(name, email),
          lender:profiles!lender_id(name, email)
        `)
        .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedAgreements: LoanAgreement[] = (data || []).map((agreement: any) => ({
        id: agreement.id,
        loanId: agreement.loan_id,
        borrowerId: agreement.borrower_id,
        lenderId: agreement.lender_id,
        agreementType: agreement.agreement_type,
        agreementData: agreement.agreement_data,
        pdfUrl: agreement.pdf_url,
        status: agreement.status,
        signedAt: agreement.signed_at ? new Date(agreement.signed_at) : undefined,
        createdAt: new Date(agreement.created_at),
        updatedAt: new Date(agreement.updated_at)
      }));

      setAgreements(formattedAgreements);
    } catch (error) {
      console.error('Error fetching agreements:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLoanRequestAgreement = async (loanData: any) => {
    if (!user || !supabase) return { data: null, error: new Error('Not authenticated') };

    try {
      // Generate terms HTML
      const termsHtml = PDFGenerator.generateLoanRequestTerms(loanData);
      
      // Generate PDF (mock implementation)
      const pdfUrl = await PDFGenerator.generatePDF(termsHtml, `loan-request-terms-${loanData.id}`);

      const agreementData = {
        loan_id: loanData.id,
        loan_title: loanData.title,
        loan_amount: loanData.amount,
        interest_rate: loanData.interestRate,
        tenure_days: loanData.tenureDays,
        purpose: loanData.purpose,
        borrower: {
          id: user.id,
          name: loanData.borrower?.name || 'Borrower',
          email: user.email
        },
        terms_accepted_at: new Date().toISOString(),
        ip_address: 'recorded',
        user_agent: navigator.userAgent
      };

      const { data, error } = await supabase
        .from('loan_agreements')
        .insert({
          loan_id: loanData.id,
          borrower_id: user.id,
          lender_id: null,
          agreement_type: 'loan_request',
          agreement_data: agreementData,
          pdf_url: pdfUrl,
          status: 'signed',
          signed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAgreements();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating loan request agreement:', error);
      return { data: null, error };
    }
  };

  const createLoanClosureDocument = async (loanRepaymentData: any) => {
    if (!user || !supabase) return { data: null, error: new Error('Not authenticated') };

    try {
      // Generate loan closure HTML
      const closureHtml = PDFGenerator.generateLoanClosureCertificate(loanRepaymentData);
      
      // Generate PDF
      const pdfUrl = await PDFGenerator.generatePDF(closureHtml, `loan-closure-${loanRepaymentData.loan_id}`);

      const agreementData = {
        loan_id: loanRepaymentData.loan_id,
        loan_amount: loanRepaymentData.loan_amount,
        repayment_amount: loanRepaymentData.repayment_amount,
        interest_rate: loanRepaymentData.interest_rate,
        platform_fee: loanRepaymentData.platform_fee,
        net_amount_to_lender: loanRepaymentData.net_amount_to_lender,
        borrower: loanRepaymentData.borrower,
        lender: loanRepaymentData.lender,
        purpose: loanRepaymentData.purpose,
        created_at: loanRepaymentData.created_at,
        repaid_at: loanRepaymentData.repaid_at || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('loan_agreements')
        .insert({
          loan_id: loanRepaymentData.loan_id,
          borrower_id: loanRepaymentData.borrower_id,
          lender_id: loanRepaymentData.lender_id,
          agreement_type: 'loan_closure',
          agreement_data: agreementData,
          pdf_url: pdfUrl,
          status: 'completed',
          signed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAgreements();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating loan closure document:', error);
      return { data: null, error };
    }
  };

  const signAgreement = async (agreementId: string) => {
    if (!user || !supabase) return { error: new Error('Not authenticated') };

    try {
      // Record signature
      const { error: signatureError } = await supabase
        .from('agreement_signatures')
        .insert({
          agreement_id: agreementId,
          signer_id: user.id,
          signature_type: 'borrower', // or 'lender' based on user role
          ip_address: 'recorded',
          user_agent: navigator.userAgent
        });

      if (signatureError) throw signatureError;

      // Update agreement status
      const { error: updateError } = await supabase
        .from('loan_agreements')
        .update({
          status: 'signed',
          signed_at: new Date().toISOString()
        })
        .eq('id', agreementId);

      if (updateError) throw updateError;

      await fetchAgreements();
      return { error: null };
    } catch (error: any) {
      console.error('Error signing agreement:', error);
      return { error };
    }
  };

  useEffect(() => {
    if (user) {
      fetchAgreements();
    }
  }, [user]);

  return {
    agreements,
    loading,
    createLoanRequestAgreement,
    createLoanClosureDocument,
    signAgreement,
    refetch: fetchAgreements
  };
}