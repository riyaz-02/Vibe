import React, { useState } from 'react';
import { FileText, Download, Eye, Calendar, User, DollarSign, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAgreements } from '../../hooks/useAgreements';
import { LoanAgreement } from '../../types';
import { PDFGenerator } from '../../utils/pdfGenerator';

const AgreementsSection: React.FC = () => {
  const { agreements, loading } = useAgreements();
  const [selectedAgreement, setSelectedAgreement] = useState<LoanAgreement | null>(null);

  const getAgreementIcon = (type: string) => {
    switch (type) {
      case 'loan_request':
        return { icon: FileText, color: 'text-blue-500 bg-blue-50' };
      case 'sanction_letter':
        return { icon: CheckCircle, color: 'text-green-500 bg-green-50' };
      case 'lending_proof':
        return { icon: DollarSign, color: 'text-purple-500 bg-purple-50' };
      default:
        return { icon: FileText, color: 'text-gray-500 bg-gray-50' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'signed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAgreementType = (type: string) => {
    switch (type) {
      case 'loan_request':
        return 'Loan Request Terms';
      case 'sanction_letter':
        return 'Sanction Letter';
      case 'lending_proof':
        return 'Lending Proof';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = async (agreement: LoanAgreement) => {
    try {
      let htmlContent = '';
      let filename = '';

      switch (agreement.agreementType) {
        case 'loan_request':
          htmlContent = PDFGenerator.generateLoanRequestTerms(agreement.agreementData);
          filename = `loan-request-terms-${agreement.id}`;
          break;
        case 'sanction_letter':
          htmlContent = PDFGenerator.generateSanctionLetter(agreement.agreementData);
          filename = `sanction-letter-${agreement.id}`;
          break;
        case 'lending_proof':
          htmlContent = PDFGenerator.generateLendingProof(agreement.agreementData);
          filename = `lending-proof-${agreement.id}`;
          break;
        default:
          htmlContent = `<html><body><h1>Agreement Document</h1><pre>${JSON.stringify(agreement.agreementData, null, 2)}</pre></body></html>`;
          filename = `agreement-${agreement.id}`;
      }

      // Create and download HTML file (in production, this would be a PDF)
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading agreement:', error);
    }
  };

  const handleView = (agreement: LoanAgreement) => {
    setSelectedAgreement(agreement);
  };

  const renderAgreementDetails = (agreementData: any, type: string) => {
    if (!agreementData) return null;

    switch (type) {
      case 'loan_request':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Loan Title:</span>
                <div className="font-medium">{agreementData.loan_title || 'N/A'}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Amount:</span>
                <div className="font-medium">{agreementData.loan_amount ? formatCurrency(agreementData.loan_amount) : 'N/A'}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Interest Rate:</span>
                <div className="font-medium">{agreementData.interest_rate || 'N/A'}% per annum</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Tenure:</span>
                <div className="font-medium">{agreementData.tenure_days || 'N/A'} days</div>
              </div>
            </div>
            {agreementData.borrower && (
              <div>
                <span className="text-sm text-gray-500">Borrower:</span>
                <div className="font-medium">{agreementData.borrower.name} ({agreementData.borrower.email})</div>
              </div>
            )}
          </div>
        );

      case 'sanction_letter':
      case 'lending_proof':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Loan Amount:</span>
                <div className="font-medium">{agreementData.loan_amount ? formatCurrency(agreementData.loan_amount) : 'N/A'}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Funded Amount:</span>
                <div className="font-medium">{agreementData.funded_amount ? formatCurrency(agreementData.funded_amount) : 'N/A'}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Interest Rate:</span>
                <div className="font-medium">{agreementData.interest_rate || 'N/A'}% per annum</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Tenure:</span>
                <div className="font-medium">{agreementData.tenure_days || 'N/A'} days</div>
              </div>
            </div>
            
            {agreementData.borrower && (
              <div>
                <span className="text-sm text-gray-500">Borrower:</span>
                <div className="font-medium">{agreementData.borrower.name} ({agreementData.borrower.email})</div>
              </div>
            )}
            
            {agreementData.lender && (
              <div>
                <span className="text-sm text-gray-500">Lender:</span>
                <div className="font-medium">{agreementData.lender.name} ({agreementData.lender.email})</div>
              </div>
            )}
            
            {agreementData.terms && (
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-sm text-gray-500">Repayment Terms:</span>
                <div className="mt-2 space-y-1 text-sm">
                  <div>Total Repayment: <span className="font-medium">{formatCurrency(agreementData.terms.total_repayment)}</span></div>
                  <div>Due Date: <span className="font-medium">{formatDate(agreementData.terms.repayment_date)}</span></div>
                  <div>Late Fee: <span className="font-medium">{agreementData.terms.late_fee_percentage}% per month</span></div>
                  <div>Platform Fee: <span className="font-medium">{agreementData.terms.platform_fee_percentage}%</span></div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-600 whitespace-pre-wrap overflow-auto max-h-64">
              {JSON.stringify(agreementData, null, 2)}
            </pre>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FileText size={20} className="text-blue-500" />
          <span>Legal Documents & Agreements</span>
        </h2>
        <div className="text-sm text-gray-500">{agreements.length} documents</div>
      </div>

      {agreements.length > 0 ? (
        <div className="space-y-4">
          {agreements.map((agreement) => {
            const { icon: Icon, color } = getAgreementIcon(agreement.agreementType);
            const agreementData = agreement.agreementData;
            
            return (
              <motion.div
                key={agreement.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon size={20} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {formatAgreementType(agreement.agreementType)}
                        </h3>
                        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agreement.status)}`}>
                          {agreement.status}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        {agreementData.loan_amount && (
                          <div className="flex items-center space-x-1">
                            <DollarSign size={14} />
                            <span>{formatCurrency(agreementData.loan_amount)}</span>
                          </div>
                        )}
                        
                        {agreementData.funded_amount && (
                          <div className="flex items-center space-x-1">
                            <DollarSign size={14} />
                            <span>Funded: {formatCurrency(agreementData.funded_amount)}</span>
                          </div>
                        )}
                        
                        {(agreementData.borrower || agreementData.lender) && (
                          <div className="flex items-center space-x-1">
                            <User size={14} />
                            <span>{agreementData.borrower?.name || agreementData.lender?.name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{formatDate(agreement.createdAt)}</span>
                        </div>
                      </div>
                      
                      {agreementData.loan_title && (
                        <p className="text-sm text-gray-500 mt-1">{agreementData.loan_title}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleView(agreement)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    
                    <button
                      onClick={() => handleDownload(agreement)}
                      className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                      title="Download Document"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agreements yet</h3>
          <p className="text-gray-600">Your loan agreements and legal documents will appear here once you start lending or borrowing.</p>
        </div>
      )}

      {/* Agreement Details Modal */}
      {selectedAgreement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatAgreementType(selectedAgreement.agreementType)}
                </h3>
                <button
                  onClick={() => setSelectedAgreement(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Status:</span>
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAgreement.status)} ml-2`}>
                      {selectedAgreement.status}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Created:</span>
                    <span className="ml-2 text-sm text-gray-900">{formatDate(selectedAgreement.createdAt)}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Agreement Details</h4>
                  {renderAgreementDetails(selectedAgreement.agreementData, selectedAgreement.agreementType)}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedAgreement(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(selectedAgreement)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Download Document</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AgreementsSection;