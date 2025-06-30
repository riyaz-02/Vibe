import React, { useState } from 'react';
import { X, FileText, Shield, AlertTriangle, Check, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoanRequest } from '../../types';
import { PDFGenerator } from '../../utils/pdfGenerator';

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

  const handleDownloadTerms = () => {
    if (!loanData || !loanData.borrower) {
      console.error('Loan data or borrower information is missing');
      return;
    }

    try {
      const termsHtml = PDFGenerator.generateLoanRequestTerms(loanData);
      const blob = new Blob([termsHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `loan-terms-${loanData.title.replace(/\s+/g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating terms document:', error);
    }
  };

  // Return early if loanData is not available
  if (!loanData) {
    return null;
  }

  const repaymentAmount = loanData.amount * (1 + (loanData.interestRate / 100) * (loanData.tenure / 365));
  const repaymentDate = new Date();
  repaymentDate.setDate(repaymentDate.getDate() + loanData.tenure);

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
                    <div className="font-semibold">₹{loanData.amount?.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-blue-600">Interest:</span>
                    <div className="font-semibold">{loanData.interestRate}% p.a.</div>
                  </div>
                  <div>
                    <span className="text-blue-600">Tenure:</span>
                    <div className="font-semibold">{loanData.tenure} days</div>
                  </div>
                  <div>
                    <span className="text-blue-600">Total Repayment:</span>
                    <div className="font-semibold">₹{repaymentAmount.toFixed(0)}</div>
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
                      <p className="text-sm text-gray-600">Upon funding, sanction letters and lending agreements will be automatically generated and digitally signed on your behalf.</p>
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
                      <p className="text-sm text-gray-600">1-2% platform fee will be deducted from the funded amount. This covers verification, processing, and blockchain security.</p>
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
                    I consent to automatic generation and digital signing of sanction letters and lending agreements upon loan funding.
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
                  disabled={!loanData || !loanData.borrower}
                >
                  <Download size={16} />
                  <span>Download Terms & Conditions (HTML)</span>
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