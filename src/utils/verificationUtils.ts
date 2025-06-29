// Enhanced verification utilities using Gemini AI
import { geminiAI } from './geminiAI';

export interface VerificationResult {
  isValid: boolean;
  confidence: number;
  details: string;
  extractedData?: any;
}

// AI-powered government ID verification using Gemini
export const verifyGovernmentId = async (file: File): Promise<VerificationResult> => {
  try {
    // Basic validation first
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return {
        isValid: false,
        confidence: 0,
        details: 'File size too large. Please upload a file smaller than 10MB.'
      };
    }

    const fileName = file.name.toLowerCase();
    const isValidFormat = /\.(jpg|jpeg|png|pdf)$/i.test(fileName);
    if (!isValidFormat) {
      return {
        isValid: false,
        confidence: 0,
        details: 'Invalid file format. Please upload JPG, PNG, or PDF files only.'
      };
    }

    // Use Gemini AI for advanced verification
    const result = await geminiAI.verifyGovernmentID(file);
    
    return {
      isValid: result.isValid,
      confidence: result.confidence,
      details: result.details,
      extractedData: result.extractedData
    };
  } catch (error) {
    console.error('Government ID verification failed:', error);
    return {
      isValid: false,
      confidence: 0,
      details: 'Verification failed due to technical error. Please try again.',
      extractedData: null
    };
  }
};

// AI-powered medical prescription verification using Gemini
export const verifyMedicalPrescription = async (file: File): Promise<VerificationResult> => {
  try {
    // Basic validation
    if (file.size > 10 * 1024 * 1024) {
      return {
        isValid: false,
        confidence: 0,
        details: 'File size too large. Please upload a file smaller than 10MB.'
      };
    }

    const fileName = file.name.toLowerCase();
    const isValidFormat = /\.(jpg|jpeg|png|pdf)$/i.test(fileName);
    if (!isValidFormat) {
      return {
        isValid: false,
        confidence: 0,
        details: 'Invalid file format. Please upload JPG, PNG, or PDF files only.'
      };
    }

    // Use Gemini AI for prescription verification
    const result = await geminiAI.verifyMedicalPrescription(file);
    
    return {
      isValid: result.isValid,
      confidence: result.confidence,
      details: result.details,
      extractedData: result.extractedData
    };
  } catch (error) {
    console.error('Medical prescription verification failed:', error);
    return {
      isValid: false,
      confidence: 0,
      details: 'Verification failed due to technical error. Please try again.',
      extractedData: null
    };
  }
};

// Enhanced loan request validation
export const validateLoanRequest = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length < 10) {
    errors.push('Title must be at least 10 characters long');
  }

  if (!data.description || data.description.trim().length < 50) {
    errors.push('Description must be at least 50 characters long');
  }

  const amount = parseFloat(data.amount);
  if (!amount || amount < 100 || amount > 100000) {
    errors.push('Amount must be between ₹100 and ₹100,000');
  }

  const interestRate = parseFloat(data.interestRate);
  if (!interestRate || interestRate < 0 || interestRate > 20) {
    errors.push('Interest rate must be between 0% and 20%');
  }

  const tenure = parseInt(data.tenureDays);
  if (!tenure || tenure < 7 || tenure > 365) {
    errors.push('Tenure must be between 7 and 365 days');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Calculate loan metrics
export const calculateLoanMetrics = (amount: number, interestRate: number, tenureDays: number) => {
  const principal = amount;
  const rate = interestRate / 100;
  const time = tenureDays / 365;
  
  const interest = principal * rate * time;
  const totalRepayment = principal + interest;
  const dailyRepayment = totalRepayment / tenureDays;
  
  return {
    principal,
    interest: Math.round(interest * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
    dailyRepayment: Math.round(dailyRepayment * 100) / 100,
    effectiveAPR: ((totalRepayment / principal - 1) * (365 / tenureDays) * 100).toFixed(2)
  };
};

// AI-powered risk assessment using Gemini
export const assessLoanRisk = async (data: any, userProfile: any): Promise<{ 
  riskLevel: 'low' | 'medium' | 'high'; 
  score: number; 
  factors: string[];
  recommendations: string[];
  concerns: string[];
}> => {
  try {
    const result = await geminiAI.analyzeLoanRisk(data, userProfile);
    
    return {
      riskLevel: result.riskLevel,
      score: result.score,
      factors: [], // Legacy field
      recommendations: result.recommendations,
      concerns: result.concerns
    };
  } catch (error) {
    console.error('AI risk assessment failed, using fallback:', error);
    
    // Fallback to basic risk assessment
    let score = 50;
    const factors: string[] = [];
    const recommendations: string[] = [];
    const concerns: string[] = [];

    // Basic scoring logic
    if (userProfile?.isVerified) {
      score += 15;
      factors.push('Verified user profile');
    } else {
      score -= 10;
      concerns.push('Unverified user profile');
    }

    const amount = parseFloat(data.amount);
    if (amount > 50000) {
      score -= 15;
      concerns.push('High loan amount');
    } else if (amount < 5000) {
      score += 10;
      factors.push('Reasonable loan amount');
    }

    const interestRate = parseFloat(data.interestRate);
    if (interestRate > 15) {
      score -= 10;
      concerns.push('High interest rate offered');
    } else if (interestRate < 5) {
      score += 5;
      factors.push('Competitive interest rate');
    }

    if (userProfile?.stats?.successfulRepayments > 0) {
      score += 20;
      factors.push('Positive repayment history');
    }

    recommendations.push('Verify borrower identity');
    recommendations.push('Check repayment history');
    recommendations.push('Consider loan purpose and urgency');

    let riskLevel: 'low' | 'medium' | 'high';
    if (score >= 70) {
      riskLevel = 'low';
    } else if (score >= 40) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }

    return {
      riskLevel,
      score: Math.max(0, Math.min(100, score)),
      factors,
      recommendations,
      concerns
    };
  }
};

// Document quality assessment
export const assessDocumentQuality = (file: File): { quality: 'good' | 'fair' | 'poor'; suggestions: string[] } => {
  const suggestions: string[] = [];
  let quality: 'good' | 'fair' | 'poor' = 'good';

  // File size assessment
  if (file.size < 100 * 1024) { // Less than 100KB
    quality = 'poor';
    suggestions.push('Image appears to be low resolution. Please upload a clearer image.');
  } else if (file.size < 500 * 1024) { // Less than 500KB
    quality = 'fair';
    suggestions.push('Consider uploading a higher resolution image for better verification.');
  }

  // File type assessment
  if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
    // JPEG is good for photos
  } else if (file.type === 'image/png') {
    // PNG is good for documents
  } else if (file.type === 'application/pdf') {
    suggestions.push('PDF detected. Ensure the document is clearly visible and not password protected.');
  } else {
    quality = 'poor';
    suggestions.push('Unsupported file format. Please use JPG, PNG, or PDF.');
  }

  return { quality, suggestions };
};