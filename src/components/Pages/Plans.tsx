import React, { useState } from 'react';
import { Check, Star, Zap, Shield, TrendingUp, Users, DollarSign, Calculator, Sliders as Slider, ArrowRight, Award, Target, BarChart3, PieChart, Clock, CreditCard, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import { stripeProducts } from '../../stripe-config';
import ProductCard from '../Stripe/ProductCard';

const Plans: React.FC = () => {
  const [lendingAmount, setLendingAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(18);
  const [tenure, setTenure] = useState(24);

  // Calculate returns
  const monthlyRepayment = (lendingAmount * (interestRate / 100) / 12) + (lendingAmount / tenure);
  const totalReturns = (lendingAmount * (interestRate / 100) * (tenure / 12));
  const totalPayment = lendingAmount + totalReturns;

  const earnings = [
    {
      icon: DollarSign,
      title: 'Earnings',
      description: 'Select from available loans. Easily allocate your funds across multiple borrowers to spread risk. IndiaP2P\'s borrower sourcing focused on retail loans generating returns up to 18% p.a. for you.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Clock,
      title: 'Tenure',
      description: 'You can lend across loans up to 24 months in tenor. The expected monthly payout schedule will be available on your dashboard.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: CreditCard,
      title: 'Payout Frequency & Mode',
      description: 'Repayments (principal + interest) are received throughout the month and are transferred to your bank account in one or multiple transactions.',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const benefits = [
    'Strong earnings potential with regular payouts',
    'Monthly payouts',
    'Strongest borrowers diligence',
    'Diversify easily',
    'Reinvest and top up anytime'
  ];

  const features = [
    'Strong Diversification',
    'Secure Transactions',
    'High Quality Loans'
  ];

  const steps = [
    {
      number: 1,
      title: 'Setup Account',
      description: 'KYC Verification - Aadhaar, PAN, Bank account',
      icon: Users
    },
    {
      number: 2,
      title: 'Add Funds',
      description: 'UPI or bank transfer',
      icon: CreditCard
    },
    {
      number: 3,
      title: 'All Set',
      description: 'E-Sign Terms and conditions',
      icon: Shield
    },
    {
      number: 4,
      title: 'Select Borrowers',
      description: 'See available loans',
      icon: Target
    }
  ];

  const testimonials = [
    {
      name: 'Nitin Negi',
      role: 'Agritech Entrepreneur',
      quote: 'You are offering unbelievable returns. I look forward to the 1st of every month when they hit my bank account.',
      tags: ['second income', 'low risk']
    },
    {
      name: 'Ayush G.',
      role: 'IT Professional',
      quote: 'An investment product that I finally understand. Simple and super-easy to understand.',
      tags: ['low risk', 'high returns']
    },
    {
      name: 'Shoeb K.',
      role: 'Corporate Leader',
      quote: 'An investment that supports the business aspirations of borrowers while fulfilling my financial goals.',
      tags: ['investment product', 'second source of income']
    },
    {
      name: 'Pradeep J',
      role: 'Retired Army',
      quote: 'Great way to create a second, monthly income',
      tags: ['easy and simple investment']
    },
    {
      name: 'Sapan',
      role: 'Data Lead',
      quote: 'I like the transparency in stating returns in APR or per annum basis. No misleading IRRs or fancy return calculations.',
      tags: ['investment product with high returns']
    },
    {
      name: 'Manish Jasyal',
      role: 'Product Manager',
      quote: 'I am a conservative investor and IndiaP2P worked for me because of being RBI regulated and easy to understand.',
      tags: ['risk free', 'non-volatile']
    }
  ];

  const newsItems = [
    {
      title: 'Meet the winner of Women World Banking\'s Fintech Innovation Challenge',
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop'
    },
    {
      title: 'How an Entrepreneur is Closing the Loan Gap for Rural Women',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop'
    },
    {
      title: 'Women outpaced men in credit uptake by 17.8% in CY23: Report',
      image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop'
    }
  ];

  const faqs = [
    {
      question: 'What is Vibe\'s Monthly Income Plan Plus?',
      answer: 'Our Monthly Income Plan allows you to earn regular monthly returns from peer-to-peer lending with the flexibility to reinvest or withdraw your earnings.'
    },
    {
      question: 'What if I don\'t want to proceed with some or all of the available loan offers?',
      answer: 'You have complete control over which loans to fund. You can skip any loan offers that don\'t meet your criteria.'
    },
    {
      question: 'Why do I need to transfer funds before viewing available loans?',
      answer: 'This ensures serious intent and helps us match you with appropriate loan opportunities based on your investment capacity.'
    },
    {
      question: 'How are my investments in loans secured? What happens if the borrower doesn\'t repay?',
      answer: 'We have comprehensive borrower verification, credit scoring, and recovery processes. However, P2P lending involves risks and returns are not guaranteed.'
    },
    {
      question: 'How will I disburse funds to a borrower and how will they repay me?',
      answer: 'All transactions are handled through our secure platform with automated disbursement and repayment processes through verified bank accounts.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Choose Your <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">Plan</span>
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto">
              Unlock premium features and maximize your lending potential with our flexible plans
            </p>
          </motion.div>

          {/* RBI Verified Badge */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center space-x-2 bg-green-500/20 border border-green-400/30 rounded-full px-6 py-3">
              <Shield className="text-green-400" size={20} />
              <span className="text-green-400 font-semibold">RBI Certified NBFC-P2P</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Flexible Plans for Every Lender
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that best fits your lending goals and unlock powerful features
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {stripeProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How Users Can Earn Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              How You Can Earn
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Multiple ways to generate returns through our platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {earnings.map((item, index) => (
              <motion.div
                key={item.title}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <item.icon className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Profit Calculator */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Investment Calculator</h2>
            <p className="text-gray-600">Calculate your potential returns with our interactive calculator</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calculator Controls */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lending Amount
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="range"
                      min="10000"
                      max="1000000"
                      step="10000"
                      value={lendingAmount}
                      onChange={(e) => setLendingAmount(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-2xl font-bold text-blue-600 mt-2">
                      ₹{lendingAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Tenure
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="24"
                    step="1"
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xl font-bold text-gray-900 mt-2">
                    {tenure} Months
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NPA
                  </label>
                  <div className="text-xl font-bold text-green-600">
                    0%
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Investment Returns</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Repayments</span>
                    <span className="text-xl font-bold text-green-600">
                      upto ₹{monthlyRepayment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Lending amount</span>
                      <span className="font-semibold">₹{lendingAmount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Returns 18% (IRR)</span>
                      <span className="font-semibold text-green-600">₹{totalReturns.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-2">
                      <span>Total Payment (Principal + Interest)</span>
                      <span className="text-blue-600">₹{totalPayment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-4">* The values provided are estimates and actual may vary.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Strong earnings potential with regular payouts</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  {index === 0 && <TrendingUp className="text-blue-600" size={24} />}
                  {index === 1 && <Clock className="text-blue-600" size={24} />}
                  {index === 2 && <Shield className="text-blue-600" size={24} />}
                  {index === 3 && <PieChart className="text-blue-600" size={24} />}
                  {index === 4 && <BarChart3 className="text-blue-600" size={24} />}
                </div>
                <p className="font-medium text-gray-900">{benefit}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-8 mt-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="text-green-600" size={14} />
                </div>
                <span className="font-medium text-gray-900">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Start lending in a few simple steps
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                  {step.number}
                </div>
                <div className="bg-white rounded-xl p-6 shadow-soft">
                  <step.icon className="text-blue-500 mb-4 mx-auto" size={32} />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 text-gray-300">
                    <ArrowRight size={24} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What our investor's say about us
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {testimonial.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently asked questions
            </h2>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">
              Ready to Start Your Lending Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of investors who are already earning monthly returns with Vibe.
            </p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              Start Lending Now
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Plans;