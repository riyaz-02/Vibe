import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Clock, Zap, Info, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateInterestRate, calculateLoanMetrics } from '../../utils/interestRateCalculator';

interface LoanCalculatorProps {
  onCalculated?: (data: any) => void;
  className?: string;
}

const LoanCalculator: React.FC<LoanCalculatorProps> = ({ onCalculated, className = '' }) => {
  const [amount, setAmount] = useState<number>(10000);
  const [tenureDays, setTenureDays] = useState<number>(30);
  const [purpose, setPurpose] = useState<string>('education');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const purposes = [
    { value: 'education', label: 'Education', icon: '🎓' },
    { value: 'medical', label: 'Medical', icon: '🏥' },
    { value: 'rent', label: 'Rent', icon: '🏠' },
    { value: 'emergency', label: 'Emergency', icon: '🚨' },
    { value: 'textbooks', label: 'Textbooks', icon: '📚' },
    { value: 'assistive-devices', label: 'Assistive Devices', icon: '♿' },
    { value: 'other', label: 'Other', icon: '📋' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' }
  ];

  // Calculate interest rate when parameters change
  useEffect(() => {
    calculateLoan();
  }, [amount, tenureDays, purpose, urgency]);

  const calculateLoan = async () => {
    if (!amount || !tenureDays) return;
    
    setLoading(true);
    try {
      const interestRateResult = await calculateInterestRate({
        amount,
        tenureDays,
        purpose,
        urgency,
        borrowerCreditScore: 750, // Default credit score
        borrowerRepaymentHistory: 0 // Default repayment history
      });
      
      const metrics = calculateLoanMetrics(
        amount,
        interestRateResult.interestRate,
        tenureDays
      );
      
      const combinedResult = {
        ...interestRateResult,
        ...metrics
      };
      
      setResult(combinedResult);
      
      if (onCalculated) {
        onCalculated(combinedResult);
      }
    } catch (error) {
      console.error('Error calculating loan:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <div className="flex items-center space-x-2">
          <Calculator size={20} />
          <h3 className="text-lg font-semibold">AI-Powered Loan Calculator</h3>
        </div>
        <p className="text-blue-100 text-sm mt-1">
          Get personalized interest rates based on your loan parameters
        </p>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Amount Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Loan Amount</label>
            <span className="text-lg font-bold text-blue-600">{formatCurrency(amount)}</span>
          </div>
          <input
            type="range"
            min="1000"
            max="100000"
            step="1000"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>₹1,000</span>
            <span>₹100,000</span>
          </div>
        </div>
        
        {/* Tenure Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Loan Tenure</label>
            <span className="text-lg font-bold text-blue-600">{tenureDays} days</span>
          </div>
          <input
            type="range"
            min="7"
            max="365"
            step="1"
            value={tenureDays}
            onChange={(e) => setTenureDays(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>7 days</span>
            <span>365 days</span>
          </div>
        </div>
        
        {/* Purpose Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loan Purpose</label>
          <div className="grid grid-cols-4 gap-2">
            {purposes.map((p) => (
              <button
                key={p.value}
                onClick={() => setPurpose(p.value)}
                className={`p-2 rounded-lg text-center text-xs transition-all ${
                  purpose === p.value
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="text-lg mb-1">{p.icon}</div>
                <div className="font-medium">{p.label}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Urgency Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
          <div className="flex space-x-2">
            {urgencyLevels.map((u) => (
              <button
                key={u.value}
                onClick={() => setUrgency(u.value as any)}
                className={`flex-1 py-2 rounded-lg text-center text-xs font-medium border ${
                  urgency === u.value ? u.color : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Results */}
        {result && (
          <motion.div
            className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <Zap className="text-blue-600" size={16} />
              <span>Calculation Results</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="text-sm text-gray-500">Interest Rate</div>
                <div className="text-xl font-bold text-blue-600">{result.interestRate}%</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="text-sm text-gray-500">Total Repayment</div>
                <div className="text-xl font-bold text-gray-900">{formatCurrency(result.totalRepayment)}</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="text-sm text-gray-500">Interest Amount</div>
                <div className="text-xl font-bold text-green-600">{formatCurrency(result.interest)}</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="text-sm text-gray-500">Platform Fee</div>
                <div className="text-xl font-bold text-purple-600">
                  {formatCurrency(result.platformFee)}
                  <span className="text-xs text-gray-500 ml-1">
                    ({result.platformFeePercentage}% of interest)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 flex items-start space-x-2">
              <Info size={12} className="mt-0.5 flex-shrink-0" />
              <div>
                {result.explanation}
              </div>
            </div>
            
            <div className="mt-3 flex justify-center">
              <button className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors">
                <span>Create loan request with these parameters</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LoanCalculator;