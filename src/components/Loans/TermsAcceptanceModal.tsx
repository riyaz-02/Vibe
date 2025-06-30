import React, { useState } from 'react';
import { X, FileText, Shield, AlertTriangle, Check, Download, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFGenerator } from '../../utils/pdfGenerator';
import { calculateLoanMetrics } from '../../utils/interestRateCalculator';

interface TermsAcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  loanData: any;
  loading?: boolean;
}

const TermsAcceptanceModal: React.FC<TermsAcceptanceModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  loanData,
  loading = false
}) => {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [acceptsAutoSigning, setAcceptsAutoSigning] = useState(false);
  const [acceptsLegalBinding, setAcceptsLegalBinding] = useState(false);

  const canProceed = hasReadTerms && acceptsAutoSigning && acceptsLegalBinding;

  const handleAccept = () => {
    if (canProceed) {
      onAccept();
    }
  };

  const handleDownloadTerms = async () => {
    if (!loanData) {
      console.error('Loan data is missing');
      return;
    }

    try {
      // Ensure we have proper loan data structure
      const formattedLoanData = {
        ...loanData,
        tenure: loanData.tenure || loanData.tenureDays,
        borrower: loanData.borrower || {
          name: 'Borrower Name',
          email: 'borrower@example.com'
        }
      };

      const termsHtml = PDFGenerator.generateLoanRequestTerms(formattedLoanData);
      await PDFGenerator.generatePDF(termsHtml, `loan-terms-${(loanData.title || 'loan').replace(/\s+/g, '-')}`);
    } catch (error) {
      console.error('Error generating terms document:', error);
    }
  };

  // Return early if loanData is not available
  if (!loanData) {
    return null;
  }

  const amount = loanData.amount || 0;
  const interestRate = loanData.interestRate || 0;
  const tenure = loanData.tenure || loanData.tenureDays || 0;
  
  // Calculate loan metrics
  const loanMetrics = calculateLoanMetrics(amount, interestRate, tenure);
  const repaymentAmount = loanMetrics.totalRepayment;
  const platformFeePercentage = loanMetrics.platformFeePercentage;
  const platformFee = loanMetrics.platformFee;
  
  const repaymentDate = new Date();
  repaymentDate.setDate(repaymentDate.getDate() + tenure);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText size={24} />
                  <div>
                    <h2 className="text-xl font-bold">Terms & Conditions</h2>
                    <p className="text-blue-100">Please review and accept the loan terms</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200"
                  disabled={loading}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Loan Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-3">Loan Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Amount:</span>
                    <div className="font-semibold">₹{amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-blue-600">Interest:</span>
                    <div className="font-semibold">{interestRate}% p.a.</div>
                  </div>
                  <div>
                    <span className="text-blue-600">Tenure:</span>
                    <div className="font-semibold">{tenure} days</div>
                  </div>
                  <div>
                    <span className="text-blue-600">Total Repayment:</span>
                    <div className="font-semibold">₹{repaymentAmount.toFixed(0)}</div>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
                <div className="flex items-center space-x-2 mb-3">
                  <Calculator className="text-blue-600" size={18} />
                  <h3 className="font-semibold text-gray-900">Payment Breakdown</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Principal Amount:</span>
                    <span className="font-medium">₹{amount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Interest ({interestRate}% p.a.):</span>
                    <span className="font-medium">₹{loanMetrics.interest.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-600">Platform Fee ({platformFeePercentage}% of interest):</span>
                      <span className="text-xs text-blue-600 cursor-help" title="Platform fee is calculated as a percentage of the interest amount based on the interest rate tier">ⓘ</span>
                    </div>
                    <span className="font-medium">₹{platformFee.toLocaleString()}</span>
                  </div>
                  
                  <div className="border-t border-blue-200 pt-2 mt-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-gray-900">Total Repayment Amount:</span>
                      <span className="text-blue-700">₹{repaymentAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-500 flex items-start space-x-2">
                  <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                  <div>
                    The platform fee is deducted from the interest amount and does not affect your principal. 
                    The total repayment amount is what you'll need to pay back by the due date.
                  </div>
                </div>
              </div>

              {/* Key Terms */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Key Terms & Conditions</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Shield className="text-green-500 mt-1" size={16} />
                    <div>
                      <h4 className="font-medium text-gray-900">Automatic Agreement Generation</h4>
                      <p className="text-sm text-gray-600">Upon funding, professional sanction letters and lending agreements will be automatically generated and digitally signed on your behalf.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="text-orange-500 mt-1" size={16} />
                    <div>
                      <h4 className="font-medium text-gray-900">Repayment Obligation</h4>
                      <p className="text-sm text-gray-600">You must repay ₹{repaymentAmount.toFixed(0)} by {repaymentDate.toLocaleDateString()}. Late payments incur 2% monthly penalty.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <FileText className="text-blue-500 mt-1" size={16} />
                    <div>
                      <h4 className="font-medium text-gray-900">Platform Fees</h4>
                      <p className="text-sm text-gray-600">
                        Platform fee is calculated as a percentage of the interest amount based on the interest rate tier:
                        <ul className="mt-1 ml-4 list-disc">
                          <li>Interest rate &lt; 5%: 1.5% of interest</li>
                          <li>Interest rate 5-10%: 3.5% of interest</li>
                          <li>Interest rate &gt; 10%: 4.5% of interest</li>
                        </ul>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Shield className="text-purple-500 mt-1" size={16} />
                    <div>
                      <h4 className="font-medium text-gray-900">Legal Compliance</h4>
                      <p className="text-sm text-gray-600">This agreement is governed by Indian laws and RBI guidelines. All transactions are blockchain-secured for transparency.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="text-yellow-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2">Important Legal Notice</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• This is a legally binding agreement once accepted</li>
                      <li>• P2P lending involves financial risks</li>
                      <li>• Defaulting may affect your credit score</li>
                      <li>• All information provided must be accurate</li>
                      <li>• You consent to AI-powered verification processes</li>
                      <li>• Professional legal documents will be generated automatically</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Acceptance Checkboxes */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Acceptance Confirmation</h3>
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasReadTerms}
                    onChange={(e) => setHasReadTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I have read and understood all the terms and conditions mentioned above.
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptsAutoSigning}
                    onChange={(e) => setAcceptsAutoSigning(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I consent to automatic generation and digital signing of professional sanction letters and lending agreements upon loan funding.
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptsLegalBinding}
                    onChange={(e) => setAcceptsLegalBinding(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I understand this is a legally binding agreement and I commit to repay the loan as per the agreed terms.
                  </span>
                </label>
              </div>

              {/* Download Option */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <button
                  onClick={handleDownloadTerms}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Download size={16} />
                  <span>Download Professional Terms & Conditions (PDF)</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccept}
                  disabled={!canProceed || loading}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                    canProceed && !loading
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Accept & Submit Loan Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TermsAcceptanceModal;