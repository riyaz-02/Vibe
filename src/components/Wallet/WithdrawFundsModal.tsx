import React, { useState } from 'react';
import { X, CreditCard, Shield, AlertTriangle, Upload, IndianRupee, Building, User, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface WithdrawFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (data: any) => Promise<void>;
  loading: boolean;
  walletBalance: number;
}

const WithdrawFundsModal: React.FC<WithdrawFundsModalProps> = ({
  isOpen,
  onClose,
  onWithdraw,
  loading,
  walletBalance
}) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [phone, setPhone] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [step, setStep] = useState(1);
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawalAmount = parseFloat(amount);
    
    if (!withdrawalAmount || withdrawalAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (withdrawalAmount > walletBalance) {
      toast.error('Withdrawal amount exceeds available balance');
      return;
    }

    if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
      toast.error('Please fill in all bank details');
      return;
    }

    if (!verified) {
      toast.error('Please verify your bank details first');
      return;
    }

    try {
      setProcessingWithdrawal(true);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await onWithdraw({
        amount: withdrawalAmount,
        bankName,
        accountNumber,
        ifscCode,
        accountHolderName,
        phone
      });
      
      // Reset form
      setAmount('');
      setBankName('');
      setAccountNumber('');
      setIfscCode('');
      setAccountHolderName('');
      setPhone('');
      setProofFile(null);
      setVerified(false);
      setStep(1);
    } catch (error) {
      console.error('Withdrawal error:', error);
    } finally {
      setProcessingWithdrawal(false);
    }
  };

  const handleVerify = async () => {
    if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
      toast.error('Please fill in all bank details');
      return;
    }

    try {
      setVerifying(true);
      
      // Simulate AI verification with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would call an API to verify the bank details
      // For demo purposes, we'll simulate a successful verification
      setVerified(true);
      toast.success('Bank details verified successfully!');
      setStep(2);
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify bank details. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl max-w-md w-full p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <CreditCard className="text-white" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Withdraw Funds</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                disabled={loading || processingWithdrawal}
              >
                <X size={24} />
              </button>
            </div>

            {step === 1 ? (
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter bank name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter account number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IFSC Code
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter IFSC code"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter account holder name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Verification Required</p>
                      <p>Your bank details will be verified for security purposes. Please ensure all information is accurate.</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    disabled={verifying}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={verifying || !bankName || !accountNumber || !ifscCode || !accountHolderName}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center justify-center space-x-2"
                  >
                    {verifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Shield size={16} />
                        <span>Verify Bank Details</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Amount
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                      min="100"
                      max={walletBalance}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Available balance: {formatCurrency(walletBalance)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Proof of Account Ownership
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="proof-file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="proof-file"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <Upload className="text-gray-400 mb-2" size={24} />
                      <span className="text-sm text-gray-600">
                        {proofFile ? proofFile.name : 'Click to upload bank statement or passbook'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PDF, JPG, or PNG (max 5MB)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Shield className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">Bank Details Verified</p>
                      <p>Your bank details have been successfully verified. You can now proceed with the withdrawal.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Processing Time</p>
                      <p>Withdrawals are processed within 72 hours. Funds will be transferred to your verified bank account.</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    disabled={processingWithdrawal}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={processingWithdrawal || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > walletBalance || !proofFile}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center justify-center space-x-2"
                  >
                    {processingWithdrawal ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        <span>Withdraw Funds</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WithdrawFundsModal;