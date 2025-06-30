import React, { useState } from 'react';
import { FileText, Download, Eye, Calendar, User, DollarSign, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAgreements } from '../../hooks/useAgreements';
import { LoanAgreement } from '../../types';

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

  const handleDownload = (agreement: LoanAgreement) => {
    if (agreement.pdfUrl) {
      window.open(agreement.pdfUrl, '_blank');
    } else {
      // Generate PDF on demand
      console.log('Generating PDF for agreement:', agreement.id);
    }
  };

  const handleView = (agreement: LoanAgreement) => {
    setSelectedAgreement(agreement);
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
                            <span>₹{agreementData.loan_amount?.toLocaleString()}</span>
                          </div>
                        )}
                        
                        {agreementData.borrower && (
                          <div className="flex items-center space-x-1">
                            <User size={14} />
                            <span>{agreementData.borrower.name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{agreement.createdAt.toLocaleDateString()}</span>
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
                      title="Download PDF"
                    >
                      <Download size={16} />
                    </button>
                    
                    {agreement.pdfUrl && (
                      <button
                        onClick={() => window.open(agreement.pdfUrl, '_blank')}
                        className="p-2 text-gray-400 hover:text-purple-500 transition-colors"
                        title="Open in New Tab"
                      >
                        <ExternalLink size={16} />
                      </button>
                    )}
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
            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
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
                  <Eye size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Status:</span>
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAgreement.status)} ml-2`}>
                      {selectedAgreement.status}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Created:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedAgreement.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
                
                {selectedAgreement.agreementData && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Agreement Details</h4>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(selectedAgreement.agreementData, null, 2)}
                    </pre>
                  </div>
                )}
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
                <span>Download PDF</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AgreementsSection;