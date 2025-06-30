import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, Calendar, AlertCircle, CheckCircle, CreditCard, Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import { useAgreements } from '../../hooks/useAgreements';
import { supabase } from '../../lib/supabase';
import { PDFGenerator } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

interface BorrowedLoan {
  id: string;
  title: string;
  amount: number;
  interest_rate: number;
  tenure_days: number;
  status: string;
  created_at: string;
  total_funded: number;
  loan_fundings: Array<{
    amount: number;
    funded_at: string;
    lender_id: string;
    profiles: {
      name: string;
    };
  }>;
}

interface BorrowedLoansCardProps {
  className?: string;
}

const BorrowedLoansCard: React.FC<BorrowedLoansCardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { wallet, repayLoan, loading: walletLoading } = useWallet();
  const { agreements, createLoanClosureDocument } = useAgreements();
  const [loans, setLoans] = useState<BorrowedLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [repayingLoan, setRepayingLoan] = useState<string | null>(null);
  const [generatingDocument, setGeneratingDocument] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBorrowedLoans();
    }
  }, [user]);

  const fetchBorrowedLoans = async () => {
    if (!user || !supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('loan_requests')
        .select(`
          *,
          loan_fundings(
            amount,
            funded_at,
            lender_id,
            profiles!lender_id(name)
          )
        `)
        .eq('borrower_id', user.id)
        .in('status', ['funded', 'active'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoans(data || []);
    } catch (error) {
      console.error('Error fetching borrowed loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRepaymentAmount = (loan: BorrowedLoan) => {
    const principal = loan.total_funded;
    const interestRate = loan.interest_rate / 100;
    const timeInYears = loan.tenure_days / 365;
    const interest = principal * interestRate * timeInYears;
    return principal + interest;
  };

  const calculateDueDate = (loan: BorrowedLoan) => {
    const fundedDate = new Date(loan.loan_fundings[0]?.funded_at || loan.created_at);
    const dueDate = new Date(fundedDate);
    dueDate.setDate(dueDate.getDate() + loan.tenure_days);
    return dueDate;
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleRepayment = async (loan: BorrowedLoan) => {
    if (!wallet) {
      toast.error('Wallet not found');
      return;
    }

    const repaymentAmount = calculateRepaymentAmount(loan);
    
    if (wallet.balance < repaymentAmount) {
      toast.error('Insufficient wallet balance. Please add funds to your wallet.');
      return;
    }

    try {
      setRepayingLoan(loan.id);
      await repayLoan(loan.id, repaymentAmount);
      toast.success('Loan repaid successfully!');
      
      // Generate loan closure document
      await generateLoanClosureDocument(loan, repaymentAmount);
      
      await fetchBorrowedLoans(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to repay loan');
    } finally {
      setRepayingLoan(null);
    }
  };

  const generateLoanClosureDocument = async (loan: BorrowedLoan, repaymentAmount: number) => {
    try {
      setGeneratingDocument(loan.id);
      
      // Get borrower profile
      const { data: borrowerProfile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', user?.id)
        .single();
      
      // Get lender profile
      const { data: lenderProfile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', loan.loan_fundings[0]?.lender_id)
        .single();
      
      // Calculate platform fee (2%)
      const platformFeeRate = 0.02;
      const platformFee = repaymentAmount * platformFeeRate;
      const netAmountToLender = repaymentAmount - platformFee;
      
      // Prepare data for closure document
      const closureData = {
        loan_id: loan.id,
        borrower_id: user?.id,
        lender_id: loan.loan_fundings[0]?.lender_id,
        loan_amount: loan.amount,
        repayment_amount: repaymentAmount,
        interest_rate: loan.interest_rate,
        platform_fee: platformFee,
        net_amount_to_lender: netAmountToLender,
        purpose: loan.purpose,
        created_at: loan.created_at,
        repaid_at: new Date().toISOString(),
        borrower: borrowerProfile,
        lender: lenderProfile
      };
      
      // Create loan closure document
      const { error } = await createLoanClosureDocument(closureData);
      
      if (error) {
        console.error('Error creating loan closure document:', error);
        toast.error('Loan repaid but failed to generate closure document');
      } else {
        toast.success('Loan closure document generated successfully!');
      }
    } catch (error) {
      console.error('Error generating loan closure document:', error);
    } finally {
      setGeneratingDocument(null);
    }
  };

  const downloadLoanClosureDocument = async (loanId: string) => {
    try {
      // Find the loan closure agreement
      const closureAgreement = agreements.find(
        agreement => agreement.loanId === loanId && agreement.agreementType === 'loan_closure'
      );
      
      if (!closureAgreement) {
        toast.error('Loan closure document not found');
        return;
      }
      
      // Generate and download the PDF
      const closureHtml = PDFGenerator.generateLoanClosureCertificate(closureAgreement.agreementData);
      await PDFGenerator.generatePDF(closureHtml, `loan-closure-${loanId}`);
      
      toast.success('Loan closure document downloaded');
    } catch (error) {
      console.error('Error downloading loan closure document:', error);
      toast.error('Failed to download loan closure document');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <CreditCard className="text-orange-500" size={20} />
          <span>Borrowed Loans</span>
        </h3>
        <div className="text-sm text-gray-500">
          {loans.length} active loan{loans.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loans.length > 0 ? (
        <div className="space-y-4">
          {loans.map((loan) => {
            const repaymentAmount = calculateRepaymentAmount(loan);
            const dueDate = calculateDueDate(loan);
            const daysUntilDue = getDaysUntilDue(dueDate);
            const isOverdue = daysUntilDue < 0;
            const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;
            
            // Check if loan has a closure document
            const hasClosureDocument = agreements.some(
              agreement => agreement.loanId === loan.id && agreement.agreementType === 'loan_closure'
            );

            return (
              <motion.div
                key={loan.id}
                className={`border rounded-lg p-4 ${
                  isOverdue 
                    ? 'border-red-200 bg-red-50' 
                    : isDueSoon 
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{loan.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <DollarSign size={14} />
                        <span>Borrowed: {formatCurrency(loan.total_funded)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>Due: {formatDate(dueDate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    isOverdue 
                      ? 'bg-red-100 text-red-800' 
                      : isDueSoon 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {isOverdue ? (
                      <>
                        <AlertCircle size={12} />
                        <span>Overdue</span>
                      </>
                    ) : isDueSoon ? (
                      <>
                        <Clock size={12} />
                        <span>Due Soon</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={12} />
                        <span>On Track</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-sm text-gray-500">Repayment Amount</div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(repaymentAmount)}
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-sm text-gray-500">Interest Rate</div>
                    <div className="text-lg font-bold text-blue-600">
                      {loan.interest_rate}% p.a.
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-sm text-gray-500">Days Until Due</div>
                    <div className={`text-lg font-bold ${
                      isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {isOverdue ? `${Math.abs(daysUntilDue)} overdue` : `${daysUntilDue} days`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span>Wallet Balance: </span>
                    <span className={`font-medium ${
                      wallet && wallet.balance >= repaymentAmount 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {formatCurrency(wallet?.balance || 0)}
                    </span>
                  </div>
                  
                  {loan.status === 'completed' ? (
                    <button
                      onClick={() => downloadLoanClosureDocument(loan.id)}
                      disabled={generatingDocument === loan.id || !hasClosureDocument}
                      className="px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                    >
                      {generatingDocument === loan.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <FileText size={16} />
                          <span>Loan Closure Document</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRepayment(loan)}
                      disabled={
                        repayingLoan === loan.id || 
                        walletLoading || 
                        !wallet || 
                        wallet.balance < repaymentAmount
                      }
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                        wallet && wallet.balance >= repaymentAmount
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {repayingLoan === loan.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard size={16} />
                          <span>Repay Now</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {wallet && wallet.balance < repaymentAmount && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      Insufficient wallet balance. You need {formatCurrency(repaymentAmount - wallet.balance)} more to repay this loan.
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <CheckCircle size={48} className="text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Loans</h4>
          <p className="text-gray-600">You don't have any borrowed loans to repay at the moment.</p>
        </div>
      )}
    </motion.div>
  );
};

export default BorrowedLoansCard;