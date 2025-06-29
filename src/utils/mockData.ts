import { User, LoanRequest, Badge } from '../types';

export const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'Timely Repayer',
    description: 'Repaid all loans on time',
    icon: '🏆',
    category: 'borrower',
    earnedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Generous Lender',
    description: 'Funded 10+ loans',
    icon: '💫',
    category: 'lender',
    earnedAt: new Date('2024-02-20')
  },
  {
    id: '3',
    name: 'Impact Star',
    description: 'Funded medical/accessibility loans',
    icon: '⭐',
    category: 'community',
    earnedAt: new Date('2024-03-10')
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isVerified: true,
    badges: [mockBadges[0], mockBadges[2]],
    stats: {
      totalLoansGiven: 3,
      totalLoansTaken: 2,
      successfulRepayments: 2,
      averageRating: 4.8,
      totalAmountLent: 15000,
      totalAmountBorrowed: 8000
    },
    createdAt: new Date('2024-01-01'),
    language: 'en',
    accessibilitySettings: {
      voiceNavigation: false,
      highContrast: false,
      screenReader: false,
      fontSize: 'medium'
    }
  },
  {
    id: '2',
    name: 'Rahul Kumar',
    email: 'rahul@example.com',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isVerified: true,
    badges: [mockBadges[1]],
    stats: {
      totalLoansGiven: 12,
      totalLoansTaken: 1,
      successfulRepayments: 1,
      averageRating: 4.9,
      totalAmountLent: 45000,
      totalAmountBorrowed: 5000
    },
    createdAt: new Date('2023-12-15'),
    language: 'hi',
    accessibilitySettings: {
      voiceNavigation: true,
      highContrast: true,
      screenReader: true,
      fontSize: 'large'
    }
  }
];

export const mockLoanRequests: LoanRequest[] = [
  {
    id: '1',
    borrowerId: '1',
    borrower: mockUsers[0],
    title: 'Need funds for medical expenses - Insulin',
    description: 'Hi everyone! I\'m a diabetic student who needs help purchasing insulin for this month. My scholarship got delayed and I urgently need ₹2000 for my medication. I can repay with 4% interest in 30 days once my scholarship arrives. Any help would be deeply appreciated! 🙏',
    amount: 2000,
    currency: 'INR',
    interestRate: 4,
    tenure: 30,
    purpose: 'medical',
    status: 'active',
    fundingProgress: 65,
    totalFunded: 1300,
    lenders: [
      {
        id: '1',
        user: mockUsers[1],
        amount: 1300,
        fundedAt: new Date('2024-01-20')
      }
    ],
    createdAt: new Date('2024-01-19'),
    images: ['https://images.pexels.com/photos/3952223/pexels-photo-3952223.jpeg?auto=compress&cs=tinysrgb&w=400'],
    medicalVerification: {
      prescriptionVerified: true,
      details: 'Insulin prescription verified via Gemini AI',
      verifiedAt: new Date('2024-01-19')
    },
    likes: 23,
    comments: [
      {
        id: '1',
        userId: '2',
        user: mockUsers[1],
        content: 'Hope you get the help you need! Health is priority 💪',
        createdAt: new Date('2024-01-20')
      }
    ],
    shares: 5
  },
  {
    id: '2',
    borrowerId: '2',
    borrower: mockUsers[1],
    title: 'Room rent payment - Engineering student',
    description: 'Hello friends! I\'m a final year computer science student and my part-time job payment got delayed. I need ₹3500 for this month\'s room rent. I can pay back in 45 days with 5% interest once I receive my salary. I have a good repayment history. Thanks for considering! 🏠',
    amount: 3500,
    currency: 'INR',
    interestRate: 5,
    tenure: 45,
    purpose: 'rent',
    status: 'active',
    fundingProgress: 20,
    totalFunded: 700,
    lenders: [],
    createdAt: new Date('2024-01-18'),
    likes: 18,
    comments: [],
    shares: 3
  },
  {
    id: '3',
    borrowerId: '1',
    borrower: mockUsers[0],
    title: 'Textbooks for new semester',
    description: 'Starting my final semester and need to buy some expensive engineering textbooks. Total cost is ₹1500. Can repay in 60 days with 3% interest. These books are essential for my studies and I couldn\'t find affordable second-hand copies. Thank you! 📚',
    amount: 1500,
    currency: 'INR',
    interestRate: 3,
    tenure: 60,
    purpose: 'textbooks',
    status: 'funded',
    fundingProgress: 100,
    totalFunded: 1500,
    lenders: [
      {
        id: '2',
        user: mockUsers[1],
        amount: 1500,
        fundedAt: new Date('2024-01-17')
      }
    ],
    createdAt: new Date('2024-01-16'),
    images: ['https://images.pexels.com/photos/159581/dictionary-reference-book-learning-meaning-159581.jpeg?auto=compress&cs=tinysrgb&w=400'],
    likes: 31,
    comments: [
      {
        id: '2',
        userId: '2',
        user: mockUsers[1],
        content: 'Education is the best investment! Good luck with your studies 📖',
        createdAt: new Date('2024-01-17')
      }
    ],
    shares: 8
  }
];