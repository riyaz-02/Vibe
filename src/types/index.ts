export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isVerified: boolean;
  badges: Badge[];
  stats: UserStats;
  createdAt: Date;
  language: string;
  accessibilitySettings: AccessibilitySettings;
}

export interface UserStats {
  totalLoansGiven: number;
  totalLoansTaken: number;
  successfulRepayments: number;
  averageRating: number;
  totalAmountLent: number;
  totalAmountBorrowed: number;
}

export interface AccessibilitySettings {
  voiceNavigation: boolean;
  highContrast: boolean;
  screenReader: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'borrower' | 'lender' | 'community';
  earnedAt: Date;
}

export interface LoanRequest {
  id: string;
  borrowerId: string;
  borrower: User;
  title: string;
  description: string;
  amount: number;
  currency: string;
  interestRate: number;
  tenure: number; // in days
  purpose: LoanPurpose;
  status: LoanStatus;
  fundingProgress: number;
  totalFunded: number;
  lenders: Lender[];
  createdAt: Date;
  images?: string[];
  medicalVerification?: MedicalVerification;
  likes: number;
  comments: Comment[];
  shares: number;
  termsAccepted?: boolean;
  termsAcceptedAt?: Date;
}

export interface Lender {
  id: string;
  user: User;
  amount: number;
  fundedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  content: string;
  createdAt: Date;
}

export interface MedicalVerification {
  prescriptionVerified: boolean;
  details: string;
  verifiedAt: Date;
}

export interface LoanAgreement {
  id: string;
  loanId: string;
  borrowerId: string;
  lenderId?: string;
  agreementType: 'loan_request' | 'sanction_letter' | 'lending_proof' | 'loan_closure';
  agreementData: any;
  pdfUrl?: string;
  status: 'pending' | 'signed' | 'active' | 'completed' | 'cancelled';
  signedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgreementSignature {
  id: string;
  agreementId: string;
  signerId: string;
  signatureType: 'borrower' | 'lender';
  ipAddress?: string;
  userAgent?: string;
  signedAt: Date;
}

export type LoanPurpose = 
  | 'education'
  | 'medical'
  | 'rent'
  | 'emergency'
  | 'textbooks'
  | 'assistive-devices'
  | 'other';

export type LoanStatus = 
  | 'active'
  | 'funded'
  | 'completed'
  | 'defaulted'
  | 'cancelled';

export type Language = 
  | 'en'
  | 'hi'
  | 'hinglish'
  | 'bn'
  | 'es'
  | 'zh';

export interface Transaction {
  id: string;
  type: 'loan_disbursement' | 'repayment' | 'platform_fee';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  blockchainTxHash?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'loan_funded' | 'repayment_due' | 'badge_earned' | 'verification_complete';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}