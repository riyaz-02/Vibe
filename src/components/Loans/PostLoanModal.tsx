import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Camera, FileText, Shield, CheckCircle, AlertCircle, Eye, DollarSign, Bot, Calculator, Clock, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useLoans } from '../../hooks/useLoans';
import { useAgreements } from '../../hooks/useAgreements';
import { useTranslation } from '../../utils/translations';
import { useStore } from '../../store/useStore';
import { verifyGovernmentId, verifyMedicalPrescription, validateLoanRequest } from '../../utils/verificationUtils';
import { calculateInterestRate, calculateLoanMetrics } from '../../utils/interestRateCalculator';
import TermsAcceptanceModal from './TermsAcceptanceModal';
import toast from 'react-hot-toast';

interface PostLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostLoanModal: React.FC<PostLoanModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { createLoan } = useLoans();
  const { createLoanRequestAgreement } = useAgreements();
  const { currentLanguage, currentUser } = useStore();
  const t = useTranslation(currentLanguage);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loanDataForTerms, setLoanDataForTerms] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState({
    identity: false,
    medical: false,
    documents: false
  });
  const [calculatingRate, setCalculatingRate] = useState(false);
  const [interestRateData, setInterestRateData] = useState<any>(null);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    interestRate: '',
    tenureDays: '',
    purpose: 'education',
    urgency: 'medium'
  });

  // File uploads
  const [files, setFiles] = useState({
    identityDocument: null as File | null,
    medicalPrescription: null as File | null,
    supportingDocuments: [] as File[]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const medicalInputRef = useRef<HTMLInputElement>(null);
  const supportingInputRef = useRef<HTMLInputElement>(null);

  const purposes = [
    { value: 'education', label: 'Education Fees', icon: '🎓', requiresVerification: false },
    { value: 'medical', label: 'Medical Emergency', icon: '🏥', requiresVerification: true },
    { value: 'textbooks', label: 'Textbooks & Supplies', icon: '📚', requiresVerification: false },
    { value: 'rent', label: 'Accommodation Rent', icon: '🏠', requiresVerification: false },
    { value: 'emergency', label: 'Emergency Expenses', icon: '🚨', requiresVerification: false },
    { value: 'assistive-devices', label: 'Assistive Devices', icon: '♿', requiresVerification: true },
    { value: 'other', label: 'Other', icon: '📋', requiresVerification: false }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', color: 'text-green-600 bg-green-50' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600 bg-yellow-50' },
    { value: 'high', label: 'High Priority', color: 'text-orange-600 bg-orange-50' },
    { value: 'critical', label: 'Critical/Emergency', color: 'text-red-600 bg-red-50' }
  ];

  // Calculate interest rate and repayment amount when amount, tenure, or purpose changes
  useEffect(() => {
    const calculateRate = async () => {
      if (
        formData.amount && 
        formData.tenureDays && 
        formData.purpose &&
        parseFloat(formData.amount) > 0 &&
        parseInt(formData.tenureDays) > 0
      ) {
        setCalculatingRate(true);
        try {
          const result = await calculateInterestRate({
            amount: parseFloat(formData.amount),
            tenureDays: parseInt(formData.tenureDays),
            purpose: formData.purpose,
            urgency: formData.urgency as any,
            medicalVerified: formData.purpose === 'medical' ? verificationStatus.medical : undefined,
            borrowerCreditScore: 750, // Default credit score
            borrowerRepaymentHistory: currentUser?.stats?.successfulRepayments || 0
          });
          
          setInterestRateData(result);
          setFormData(prev => ({
            ...prev,
            interestRate: result.interestRate.toString()
          }));
        } catch (error) {
          console.error('Error calculating interest rate:', error);
        } finally {
          setCalculatingRate(false);
        }
      } else {
        setInterestRateData(null);
      }
    };
    
    calculateRate();
  }, [formData.amount, formData.tenureDays, formData.purpose, formData.urgency, verificationStatus.medical, currentUser?.stats?.successfulRepayments]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (type: 'identity' | 'medical' | 'supporting', file: File) => {
    setLoading(true);
    
    try {
      if (type === 'identity') {
        const verification = await verifyGovernmentId(file);
        setVerificationStatus(prev => ({ ...prev, identity: verification.isValid }));
        setFiles(prev => ({ ...prev, identityDocument: file }));
        
        if (verification.isValid) {
          toast.success(`Government ID verified successfully! (${Math.round(verification.confidence * 100)}% confidence)`);
        } else {
          toast.error('ID verification failed. Please upload a clear government ID.');
        }
      } else if (type === 'medical') {
        const verification = await verifyMedicalPrescription(file);
        setVerificationStatus(prev => ({ ...prev, medical: verification.isValid }));
        setFiles(prev => ({ ...prev, medicalPrescription: file }));
        
        if (verification.isValid) {
          toast.success(`Medical prescription verified! (${Math.round(verification.confidence * 100)}% confidence)`);
        } else {
          toast.error('Prescription verification failed. Please upload a valid prescription.');
        }
      } else {
        setFiles(prev => ({ 
          ...prev, 
          supportingDocuments: [...prev.supportingDocuments, file] 
        }));
        toast.success('Supporting document uploaded!');
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('File upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTermsAccept = async () => {
    if (!user || !loanDataForTerms) {
      toast.error('Please sign in to post a loan request');
      return;
    }

    setLoading(true);

    try {
      console.log('Creating loan request with terms acceptance...');
      
      // Create loan request
      const loanData = {
        title: loanDataForTerms.title,
        description: loanDataForTerms.description,
        amount: parseFloat(loanDataForTerms.amount),
        interestRate: parseFloat(loanDataForTerms.interestRate),
        tenureDays: parseInt(loanDataForTerms.tenureDays),
        purpose: loanDataForTerms.purpose,
        images: [], // In a real app, you'd upload to Supabase Storage
        borrower: loanDataForTerms.borrower
      };

      const { data: loan, error: loanError } = await createLoan(loanData);

      if (loanError) {
        console.error('Loan creation error:', loanError);
        throw loanError;
      }

      console.log('Loan created successfully:', loan);

      // Create loan request agreement with terms acceptance
      const { error: agreementError } = await createLoanRequestAgreement({
        ...loanData,
        id: loan?.id || Date.now().toString()
      });

      if (agreementError) {
        console.error('Agreement creation error:', agreementError);
        // Don't throw error here as loan is already created
        toast.error('Loan created but agreement generation failed. Please contact support.');
      } else {
        console.log('Loan request agreement created successfully');
      }

      toast.success('Loan request posted successfully with terms accepted! 🎉');
      setShowTermsModal(false);
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to post loan request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to post a loan request');
      return;
    }

    // Validate form data
    const validation = validateLoanRequest(formData);
    if (!validation.isValid) {
      toast.error(validation.errors[0]);
      return;
    }

    const selectedPurpose = purposes.find(p => p.value === formData.purpose);
    if (selectedPurpose?.requiresVerification && !verificationStatus.identity) {
      toast.error('Identity verification required for this loan type');
      return;
    }

    if (formData.purpose === 'medical' && !verificationStatus.medical) {
      toast.error('Medical prescription verification required for medical loans');
      return;
    }

    // Prepare complete loan data with borrower information
    const completeLoandData = {
      ...formData,
      amount: parseFloat(formData.amount),
      interestRate: parseFloat(formData.interestRate),
      tenure: parseInt(formData.tenureDays),
      borrower: {
        id: user.id,
        name: currentUser?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || ''
      }
    };

    setLoanDataForTerms(completeLoandData);
    setShowTermsModal(true);
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      title: '',
      description: '',
      amount: '',
      interestRate: '',
      tenureDays: '',
      purpose: 'education',
      urgency: 'medium'
    });
    setFiles({
      identityDocument: null,
      medicalPrescription: null,
      supportingDocuments: []
    });
    setVerificationStatus({
      identity: false,
      medical: false,
      documents: false
    });
    setLoanDataForTerms(null);
    setInterestRateData(null);
  };

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 4));
  };
  
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const selectedPurpose = purposes.find(p => p.value === formData.purpose);
  const requiresVerification = selectedPurpose?.requiresVerification;

  // Calculate loan metrics for display
  const loanMetrics = formData.amount && formData.interestRate && formData.tenureDays ? 
    calculateLoanMetrics(
      parseFloat(formData.amount), 
      parseFloat(formData.interestRate), 
      parseInt(formData.tenureDays)
    ) : null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Post Loan Request</h2>
                    <p className="text-gray-600 mt-1">Step {step} of 4 • AI-Powered Verification</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    <X size={24} />
                  </button>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(step / 4) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Step 1: Basic Information */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loan Title *
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Need funds for medical emergency"
                            maxLength={100}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {formData.title.length}/100 characters
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Purpose *
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {purposes.map((purpose) => (
                              <button
                                key={purpose.value}
                                type="button"
                                onClick={() => handleInputChange('purpose', purpose.value)}
                                className={`p-3 rounded-lg border-2 transition-all text-left ${
                                  formData.purpose === purpose.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">{purpose.icon}</span>
                                  <div>
                                    <div className="font-medium text-sm">{purpose.label}</div>
                                    {purpose.requiresVerification && (
                                      <div className="text-xs text-orange-600 flex items-center space-x-1">
                                        <Bot size={10} />
                                        <span>AI verification required</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Amount (₹) *
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                              <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => handleInputChange('amount', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="5000"
                                min="100"
                                max="100000"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tenure (Days) *
                            </label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                              <input
                                type="number"
                                value={formData.tenureDays}
                                onChange={(e) => handleInputChange('tenureDays', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="30"
                                min="7"
                                max="365"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Urgency Level
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {urgencyLevels.map((level) => (
                              <button
                                key={level.value}
                                type="button"
                                onClick={() => handleInputChange('urgency', level.value)}
                                className={`p-2 rounded-lg text-sm font-medium transition-all ${
                                  formData.urgency === level.value
                                    ? level.color + ' border-2 border-current'
                                    : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                                }`}
                              >
                                {level.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* AI-Calculated Interest Rate */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Calculator className="text-blue-600" size={20} />
                              <h4 className="font-medium text-gray-900">AI-Calculated Interest Rate</h4>
                            </div>
                            {calculatingRate ? (
                              <div className="flex items-center space-x-2 text-blue-600">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm">Calculating...</span>
                              </div>
                            ) : interestRateData ? (
                              <div className="text-lg font-bold text-blue-600">
                                {interestRateData.interestRate}%
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">
                                Enter loan details
                              </div>
                            )}
                          </div>

                          {interestRateData && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-white p-2 rounded border border-blue-100">
                                  <div className="text-gray-500">Repayment Amount</div>
                                  <div className="font-semibold text-gray-900">₹{interestRateData.repaymentAmount.toLocaleString('en-IN', {maximumFractionDigits: 0})}</div>
                                </div>
                                <div className="bg-white p-2 rounded border border-blue-100">
                                  <div className="text-gray-500">Platform Fee</div>
                                  <div className="font-semibold text-gray-900">
                                    {interestRateData.platformFeePercentage}% of principal
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-600">
                                <div className="flex items-start space-x-1">
                                  <Info size={12} className="mt-0.5 flex-shrink-0" />
                                  <div>{interestRateData.explanation}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Description */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Description</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Describe your situation and why you need this loan *
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={8}
                          placeholder="Please provide detailed information about:
- Why you need this loan
- How you plan to use the funds
- Your repayment plan
- Any relevant background information
- Timeline and urgency"
                          maxLength={1000}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {formData.description.length}/1000 characters
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <h4 className="font-medium text-blue-900 mb-2">💡 Tips for a successful loan request:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Be honest and transparent about your situation</li>
                          <li>• Explain how the loan will help solve your problem</li>
                          <li>• Provide a realistic repayment timeline</li>
                          <li>• Include any relevant supporting information</li>
                          <li>• Use proper grammar and spelling</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: AI Verification & Documents */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        AI-Powered Verification & Documents
                      </h3>
                      
                      {/* Identity Verification */}
                      <div className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Shield className="text-blue-500" size={20} />
                            <h4 className="font-medium text-gray-900">AI Identity Verification</h4>
                            {requiresVerification && <span className="text-red-500 text-sm">*Required</span>}
                          </div>
                          {verificationStatus.identity && (
                            <CheckCircle className="text-green-500" size={20} />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          Upload a government-issued ID. Our AI will verify authenticity using Gemini Vision API.
                        </p>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('identity', file);
                          }}
                          className="hidden"
                        />
                        
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          disabled={loading}
                        >
                          <Upload size={16} />
                          <span>{files.identityDocument ? 'Change Document' : 'Upload ID Document'}</span>
                          {loading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                        </button>
                        
                        {files.identityDocument && (
                          <div className="mt-2 text-sm text-gray-600">
                            ✓ {files.identityDocument.name}
                          </div>
                        )}
                      </div>

                      {/* Medical Prescription (for medical loans) */}
                      {formData.purpose === 'medical' && (
                        <div className="border border-gray-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <FileText className="text-red-500" size={20} />
                              <h4 className="font-medium text-gray-900">AI Prescription Verification</h4>
                              <span className="text-red-500 text-sm">*Required</span>
                            </div>
                            {verificationStatus.medical && (
                              <CheckCircle className="text-green-500" size={20} />
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            Upload a valid medical prescription. Our AI will verify doctor details and medications.
                          </p>
                          
                          <input
                            ref={medicalInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload('medical', file);
                            }}
                            className="hidden"
                          />
                          
                          <button
                            type="button"
                            onClick={() => medicalInputRef.current?.click()}
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                          >
                            <Upload size={16} />
                            <span>{files.medicalPrescription ? 'Change Prescription' : 'Upload Prescription'}</span>
                            {loading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                          </button>
                          
                          {files.medicalPrescription && (
                            <div className="mt-2 text-sm text-gray-600">
                              ✓ {files.medicalPrescription.name}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Supporting Documents */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Camera className="text-gray-500" size={20} />
                          <h4 className="font-medium text-gray-900">Supporting Documents</h4>
                          <span className="text-gray-500 text-sm">(Optional)</span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          Upload any additional documents that support your loan request (bills, receipts, etc.)
                        </p>
                        
                        <input
                          ref={supportingInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            files.forEach(file => handleFileUpload('supporting', file));
                          }}
                          className="hidden"
                        />
                        
                        <button
                          type="button"
                          onClick={() => supportingInputRef.current?.click()}
                          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          disabled={loading}
                        >
                          <Upload size={16} />
                          <span>Upload Supporting Documents</span>
                        </button>
                        
                        {files.supportingDocuments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {files.supportingDocuments.map((file, index) => (
                              <div key={index} className="text-sm text-gray-600">
                                ✓ {file.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {loading && (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <span className="ml-2 text-gray-600">AI is analyzing your documents...</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Review & Submit */}
                {step === 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Submit</h3>
                      
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-500">Title:</span>
                            <p className="font-medium">{formData.title}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Purpose:</span>
                            <p className="font-medium">{selectedPurpose?.label}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Amount:</span>
                            <p className="font-medium">₹{parseFloat(formData.amount).toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Interest Rate:</span>
                            <p className="font-medium">{formData.interestRate}%</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Tenure:</span>
                            <p className="font-medium">{formData.tenureDays} days</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Urgency:</span>
                            <p className="font-medium capitalize">{formData.urgency}</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm text-gray-500">Description:</span>
                          <p className="mt-1 text-sm">{formData.description}</p>
                        </div>
                      </div>

                      {/* Loan Metrics */}
                      {loanMetrics && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                            <Calculator className="text-blue-600" size={16} />
                            <span>Loan Metrics</span>
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded-lg border border-blue-100">
                              <div className="text-sm text-gray-500">Total Repayment</div>
                              <div className="text-lg font-bold text-gray-900">₹{loanMetrics.totalRepayment.toLocaleString('en-IN')}</div>
                            </div>
                            
                            <div className="bg-white p-3 rounded-lg border border-blue-100">
                              <div className="text-sm text-gray-500">Interest Amount</div>
                              <div className="text-lg font-bold text-blue-600">₹{loanMetrics.interest.toLocaleString('en-IN')}</div>
                            </div>
                            
                            <div className="bg-white p-3 rounded-lg border border-blue-100">
                              <div className="text-sm text-gray-500">Platform Fee</div>
                              <div className="text-lg font-bold text-purple-600">
                                ₹{loanMetrics.platformFee.toLocaleString('en-IN')}
                                <span className="text-xs text-gray-500 ml-1">
                                  ({loanMetrics.platformFeePercentage}% of principal)
                                </span>
                              </div>
                            </div>
                            
                            <div className="bg-white p-3 rounded-lg border border-blue-100">
                              <div className="text-sm text-gray-500">Effective APR</div>
                              <div className="text-lg font-bold text-green-600">{loanMetrics.effectiveAPR}%</div>
                            </div>
                          </div>
                          
                          <div className="mt-3 text-xs text-gray-600 flex items-start space-x-2">
                            <Info size={12} className="mt-0.5 flex-shrink-0" />
                            <div>
                              The platform fee is calculated as a percentage of the principal amount.
                              This fee is deducted from the principal amount when the loan is funded.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Verification Status */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                          <Bot className="text-blue-500" size={16} />
                          <span>AI Verification Status</span>
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Identity Verification</span>
                            {verificationStatus.identity ? (
                              <CheckCircle className="text-green-500" size={16} />
                            ) : requiresVerification ? (
                              <AlertCircle className="text-red-500" size={16} />
                            ) : (
                              <span className="text-gray-400 text-sm">Optional</span>
                            )}
                          </div>
                          {formData.purpose === 'medical' && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Medical Prescription</span>
                              {verificationStatus.medical ? (
                                <CheckCircle className="text-green-500" size={16} />
                              ) : (
                                <AlertCircle className="text-red-500" size={16} />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Legal Notice */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 mb-2">⚖️ Legal Agreement Notice</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• By submitting this request, you agree to our Terms & Conditions</li>
                          <li>• Sanction letters will be automatically generated upon funding</li>
                          <li>• All agreements will be digitally signed on your behalf</li>
                          <li>• Legal documents will be available in your profile</li>
                          <li>• This creates a legally binding obligation to repay</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={step === 1 ? onClose : prevStep}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    {step === 1 ? 'Cancel' : 'Previous'}
                  </button>
                  
                  {step < 4 ? (
                    <button
                      onClick={nextStep}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all"
                      disabled={loading}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={loading || (requiresVerification && !verificationStatus.identity) || (formData.purpose === 'medical' && !verificationStatus.medical)}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                      <span>Review Terms & Submit</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Terms Acceptance Modal */}
      <TermsAcceptanceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccept}
        loanData={loanDataForTerms}
        loading={loading}
      />
    </>
  );
};

export default PostLoanModal;