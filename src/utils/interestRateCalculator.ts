import { geminiAI } from './geminiAI';

export interface LoanParameters {
  amount: number;
  tenureDays: number;
  purpose: string;
  borrowerCreditScore?: number;
  borrowerRepaymentHistory?: number;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  medicalVerified?: boolean;
}

export interface InterestRateResult {
  interestRate: number;
  platformFeePercentage: number;
  platformFee: number;
  repaymentAmount: number;
  explanation: string;
  factors: string[];
}

/**
 * Calculates the appropriate interest rate for a loan based on various parameters
 * using AI-powered risk assessment and market conditions
 */
export const calculateInterestRate = async (params: LoanParameters): Promise<InterestRateResult> => {
  try {
    // Try to use Gemini AI for intelligent interest rate calculation
    const aiResult = await calculateInterestRateWithAI(params);
    return aiResult;
  } catch (error) {
    console.error('AI interest rate calculation failed, using fallback:', error);
    // Fallback to rule-based calculation if AI fails
    return calculateInterestRateWithRules(params);
  }
};

/**
 * Uses Gemini AI to calculate an appropriate interest rate based on loan parameters
 */
const calculateInterestRateWithAI = async (params: LoanParameters): Promise<InterestRateResult> => {
  try {
    // Prepare the prompt for Gemini AI
    const result = await geminiAI.analyzeLoanRisk({
      amount: params.amount,
      purpose: params.purpose,
      tenureDays: params.tenureDays,
      urgency: params.urgency || 'medium',
      medicalVerified: params.medicalVerified || false
    }, {
      creditScore: params.borrowerCreditScore || 750,
      repaymentHistory: params.borrowerRepaymentHistory || 0
    });

    // Calculate interest rate based on risk assessment
    let interestRate = 0;
    
    if (result.riskLevel === 'low') {
      interestRate = 5 + (Math.random() * 2); // 5-7%
    } else if (result.riskLevel === 'medium') {
      interestRate = 7 + (Math.random() * 3); // 7-10%
    } else {
      interestRate = 10 + (Math.random() * 5); // 10-15%
    }
    
    // Apply purpose-based adjustments
    if (params.purpose === 'medical' && params.medicalVerified) {
      interestRate -= 2; // Lower rates for verified medical purposes
    } else if (params.purpose === 'education') {
      interestRate -= 1; // Slightly lower rates for education
    } else if (params.purpose === 'emergency' && params.urgency === 'critical') {
      interestRate -= 0.5; // Small discount for critical emergencies
    }
    
    // Apply tenure-based adjustments
    if (params.tenureDays <= 30) {
      interestRate += 1; // Higher rates for very short terms
    } else if (params.tenureDays >= 180) {
      interestRate -= 0.5; // Lower rates for longer terms
    }
    
    // Apply amount-based adjustments
    if (params.amount < 5000) {
      interestRate += 1; // Higher rates for very small amounts
    } else if (params.amount > 50000) {
      interestRate -= 0.5; // Lower rates for larger amounts
    }
    
    // Ensure interest rate is within reasonable bounds
    interestRate = Math.max(3, Math.min(18, interestRate));
    interestRate = parseFloat(interestRate.toFixed(2)); // Round to 2 decimal places
    
    // Fixed platform fee percentage of 4.5% of principal amount
    const platformFeePercentage = 4.5;
    
    // Calculate repayment amount and platform fee
    const principal = params.amount;
    const timeInYears = params.tenureDays / 365;
    const interestAmount = principal * (interestRate / 100) * timeInYears;
    const platformFee = principal * (platformFeePercentage / 10000);
    const repaymentAmount = principal + interestAmount;
    
    // Generate explanation
    const explanation = `Based on the loan parameters and risk assessment, an interest rate of ${interestRate}% has been calculated. This considers the loan amount (₹${params.amount}), tenure (${params.tenureDays} days), purpose (${params.purpose}), and other risk factors. The platform fee is ${platformFeePercentage}% of the principal amount.`;
    
    // Extract factors from AI recommendations and concerns
    const factors = [
      ...result.recommendations,
      ...result.concerns
    ];
    
    return {
      interestRate,
      platformFeePercentage,
      platformFee,
      repaymentAmount,
      explanation,
      factors
    };
  } catch (error) {
    console.error('Error calculating interest rate with AI:', error);
    throw error;
  }
};

/**
 * Fallback rule-based interest rate calculation if AI fails
 */
const calculateInterestRateWithRules = (params: LoanParameters): InterestRateResult => {
  // Base interest rate by purpose
  let interestRate = 0;
  const factors: string[] = [];
  
  // Set base rate by purpose
  switch (params.purpose) {
    case 'medical':
      interestRate = params.medicalVerified ? 5 : 8;
      factors.push(params.medicalVerified ? 
        'Verified medical purpose qualifies for lower interest rate' : 
        'Unverified medical purpose');
      break;
    case 'education':
      interestRate = 6;
      factors.push('Education purpose qualifies for favorable interest rate');
      break;
    case 'textbooks':
      interestRate = 7;
      factors.push('Educational materials purpose');
      break;
    case 'rent':
      interestRate = 9;
      factors.push('Housing/rent purpose');
      break;
    case 'emergency':
      interestRate = 10;
      factors.push('Emergency purpose loan');
      break;
    case 'assistive-devices':
      interestRate = 5.5;
      factors.push('Assistive devices purpose qualifies for lower interest rate');
      break;
    default:
      interestRate = 12;
      factors.push('General purpose loan');
  }
  
  // Adjust for loan amount
  if (params.amount < 2000) {
    interestRate += 2;
    factors.push('Small loan amount increases risk');
  } else if (params.amount < 5000) {
    interestRate += 1;
    factors.push('Moderate loan amount');
  } else if (params.amount > 20000) {
    interestRate -= 0.5;
    factors.push('Larger loan amount qualifies for slight rate reduction');
  }
  
  // Adjust for tenure
  if (params.tenureDays < 30) {
    interestRate += 1.5;
    factors.push('Very short tenure increases rate');
  } else if (params.tenureDays < 60) {
    interestRate += 0.5;
    factors.push('Short tenure');
  } else if (params.tenureDays > 180) {
    interestRate -= 0.5;
    factors.push('Longer tenure qualifies for rate reduction');
  }
  
  // Adjust for urgency
  if (params.urgency === 'critical') {
    interestRate -= 1;
    factors.push('Critical urgency qualifies for rate reduction');
  } else if (params.urgency === 'high') {
    interestRate -= 0.5;
    factors.push('High urgency');
  }
  
  // Ensure interest rate is within reasonable bounds
  interestRate = Math.max(3, Math.min(18, interestRate));
  interestRate = parseFloat(interestRate.toFixed(2)); // Round to 2 decimal places
  
  // Fixed platform fee percentage of 4.5% of principal amount
  const platformFeePercentage = 4.5;
  
  // Calculate repayment amount and platform fee
  const principal = params.amount;
  const timeInYears = params.tenureDays / 365;
  const interestAmount = principal * (interestRate / 100) * timeInYears;
  const platformFee = principal * (platformFeePercentage / 100);
  const repaymentAmount = principal + interestAmount + platformFee;
  
  // Generate explanation
  const explanation = `Based on standard rules, an interest rate of ${interestRate}% has been calculated for this ${params.purpose} loan of ₹${params.amount} for ${params.tenureDays} days. The platform fee is ${platformFeePercentage}% of the principal amount.`;
  
  return {
    interestRate,
    platformFeePercentage,
    platformFee,
    repaymentAmount,
    explanation,
    factors
  };
};

/**
 * Calculates loan metrics based on the provided parameters
 */
export const calculateLoanMetrics = (
  amount: number, 
  interestRate: number, 
  tenureDays: number
): {
  principal: number;
  interest: number;
  totalRepayment: number;
  dailyRepayment: number;
  effectiveAPR: string;
  platformFeePercentage: number;
  platformFee: number;
} => {
  const principal = amount;
  const rate = interestRate / 100;
  const time = tenureDays / 365;
  
  const interest = principal * rate * time;
  const totalRepayment = principal + interest;
  const dailyRepayment = totalRepayment / tenureDays;
  
  // Fixed platform fee percentage of 4.5% of principal amount
  const platformFeePercentage = 4.5;
  
  // Calculate platform fee
  const platformFee = principal * (platformFeePercentage / 10000);
  
  return {
    principal,
    interest: Math.round(interest * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
    dailyRepayment: Math.round(dailyRepayment * 100) / 100,
    effectiveAPR: ((totalRepayment / principal - 1) * (365 / tenureDays) * 100).toFixed(2),
    platformFeePercentage,
    platformFee: Math.round(platformFee * 100) / 10000
  };
};