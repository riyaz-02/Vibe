// Verification utilities for government ID and medical prescriptions

export interface VerificationResult {
  isValid: boolean;
  confidence: number;
  details: string;
  extractedData?: any;
}

// Mock AI-powered government ID verification
export const verifyGovernmentId = async (file: File): Promise<VerificationResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate AI verification process
      const fileName = file.name.toLowerCase();
      const fileSize = file.size;
      
      // Basic validation
      if (fileSize > 10 * 1024 * 1024) { // 10MB limit
        resolve({
          isValid: false,
          confidence: 0,
          details: 'File size too large. Please upload a file smaller than 10MB.'
        });
        return;
      }

      // Simulate OCR and validation
      const isValidFormat = /\.(jpg|jpeg|png|pdf)$/i.test(fileName);
      if (!isValidFormat) {
        resolve({
          isValid: false,
          confidence: 0,
          details: 'Invalid file format. Please upload JPG, PNG, or PDF files only.'
        });
        return;
      }

      // Mock AI verification (in real implementation, this would call Gemini Vision API)
      const mockConfidence = Math.random() * 0.3 + 0.7; // 70-100% confidence
      const isValid = mockConfidence > 0.75;

      resolve({
        isValid,
        confidence: mockConfidence,
        details: isValid 
          ? 'Government ID verified successfully. Document appears authentic.'
          : 'ID verification failed. Document may be unclear or invalid.',
        extractedData: isValid ? {
          documentType: 'Aadhaar Card',
          name: 'John Doe',
          idNumber: 'XXXX-XXXX-1234'
        } : null
      });
    }, 2000); // Simulate processing time
  });
};

// Mock AI-powered medical prescription verification
export const verifyMedicalPrescription = async (file: File): Promise<VerificationResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fileName = file.name.toLowerCase();
      const fileSize = file.size;
      
      // Basic validation
      if (fileSize > 10 * 1024 * 1024) {
        resolve({
          isValid: false,
          confidence: 0,
          details: 'File size too large. Please upload a file smaller than 10MB.'
        });
        return;
      }

      const isValidFormat = /\.(jpg|jpeg|png|pdf)$/i.test(fileName);
      if (!isValidFormat) {
        resolve({
          isValid: false,
          confidence: 0,
          details: 'Invalid file format. Please upload JPG, PNG, or PDF files only.'
        });
        return;
      }

      // Mock medical prescription verification using Gemini Vision API
      const mockConfidence = Math.random() * 0.4 + 0.6; // 60-100% confidence
      const isValid = mockConfidence > 0.7;

      resolve({
        isValid,
        confidence: mockConfidence,
        details: isValid 
          ? 'Medical prescription verified. Valid doctor prescription detected.'
          : 'Prescription verification failed. Document may not be a valid medical prescription.',
        extractedData: isValid ? {
          doctorName: 'Dr. Smith',
          hospitalName: 'City Hospital',
          medications: ['Medicine A', 'Medicine B'],
          date: new Date().toISOString().split('T')[0],
          patientName: 'Patient Name'
        } : null
      });
    }, 3000); // Simulate processing time
  });
};

// Validate loan request data
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

// Risk assessment for loan requests
export const assessLoanRisk = (data: any, userProfile: any): { riskLevel: 'low' | 'medium' | 'high'; score: number; factors: string[] } => {
  let score = 50; // Base score
  const factors: string[] = [];

  // User verification status
  if (userProfile?.isVerified) {
    score += 15;
    factors.push('Verified user profile');
  } else {
    score -= 10;
    factors.push('Unverified user profile');
  }

  // Loan amount relative to user history
  const amount = parseFloat(data.amount);
  if (amount > 50000) {
    score -= 15;
    factors.push('High loan amount');
  } else if (amount < 5000) {
    score += 10;
    factors.push('Reasonable loan amount');
  }

  // Interest rate assessment
  const interestRate = parseFloat(data.interestRate);
  if (interestRate > 15) {
    score -= 10;
    factors.push('High interest rate offered');
  } else if (interestRate < 5) {
    score += 5;
    factors.push('Competitive interest rate');
  }

  // Purpose assessment
  const lowRiskPurposes = ['education', 'textbooks'];
  const highRiskPurposes = ['emergency', 'other'];
  
  if (lowRiskPurposes.includes(data.purpose)) {
    score += 10;
    factors.push('Low-risk loan purpose');
  } else if (highRiskPurposes.includes(data.purpose)) {
    score -= 5;
    factors.push('Higher-risk loan purpose');
  }

  // Tenure assessment
  const tenure = parseInt(data.tenureDays);
  if (tenure > 180) {
    score -= 10;
    factors.push('Long repayment period');
  } else if (tenure < 30) {
    score += 5;
    factors.push('Short repayment period');
  }

  // User's repayment history
  if (userProfile?.stats?.successfulRepayments > 0) {
    score += 20;
    factors.push('Positive repayment history');
  }

  // Determine risk level
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
    factors
  };
};