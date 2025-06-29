import React, { useState } from 'react';
import { Search, HelpCircle, Shield, CreditCard, Users, Volume2, Eye, Globe, ExternalLink } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { motion } from 'framer-motion';
import { voiceManager } from '../../utils/voiceUtils';

const Help: React.FC = () => {
  const { currentLanguage } = useStore();
  const t = useTranslation(currentLanguage);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'getting-started', name: 'Getting Started', icon: Users },
    { id: 'security', name: 'Security & Safety', icon: Shield },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'accessibility', name: 'Accessibility', icon: Eye }
  ];

  const faqData = [
    {
      category: 'getting-started',
      question: 'How does P2P lending work on LendConnect?',
      answer: 'LendConnect connects students who need funds with those willing to lend. Borrowers post loan requests with details like amount, purpose, and repayment terms. Lenders can browse these requests and choose to fund loans that align with their preferences. All transactions are secured through blockchain technology.'
    },
    {
      category: 'getting-started',
      question: 'How do I get verified on the platform?',
      answer: 'Verification involves multiple steps: 1) Email and phone verification via OTP, 2) Identity verification using photo ID and PAN card through our KYC partners, 3) Bank account linking for secure payments. Your verified identity is stored securely on the Algorand blockchain.'
    },
    {
      category: 'security',
      question: 'How secure are my transactions?',
      answer: 'All transactions are secured using Algorand blockchain technology, ensuring transparency and immutability. We use enterprise-grade encryption for data protection and comply with GDPR and RBI guidelines. Your funds are processed through secure payment gateways like Razorpay and Stripe.'
    },
    {
      category: 'security',
      question: 'What happens if a borrower defaults?',
      answer: 'We have multiple safeguards: credit scoring, borrower verification, and community ratings. However, P2P lending involves inherent risks. We recommend diversifying your lending portfolio and carefully assessing each loan request. Our platform fee (1-2%) partially covers risk management operations.'
    },
    {
      category: 'payments',
      question: 'What are the platform fees?',
      answer: 'LendConnect charges a 1-2% platform fee on successful loan transactions. This fee covers operational costs, security measures, blockchain transaction fees, and platform maintenance. The fee is transparently shown before confirming any transaction.'
    },
    {
      category: 'payments',
      question: 'How do repayments work?',
      answer: 'Repayments are automated through scheduled bank transfers. Borrowers set up auto-debit mandates during loan acceptance. If automatic repayment fails, borrowers receive notifications and can make manual payments through the dashboard. All repayment history is tracked and affects credit scores.'
    },
    {
      category: 'accessibility',
      question: 'What accessibility features are available?',
      answer: 'LendConnect is designed for universal access: Voice navigation using Web Speech API and ElevenLabs, screen reader compatibility with ARIA attributes, high contrast mode for visual impairments, multi-language support including regional languages, and keyboard navigation for motor impairments.'
    },
    {
      category: 'accessibility',
      question: 'How do I use voice navigation?',
      answer: 'Click the microphone icon in the top navigation or say "start voice navigation". Available commands include: "go home", "open dashboard", "view profile", "post loan", and "help". Voice navigation supports multiple languages and works with both browser speech recognition and our ElevenLabs integration.'
    }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleVoiceHelp = (text: string) => {
    voiceManager.speak(text, currentLanguage === 'hi' ? 'hi-IN' : 'en-US');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('nav.help')} Center</h1>
          <p className="text-gray-600">Find answers to common questions and learn how to use LendConnect effectively</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </motion.div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Voice Commands', icon: Volume2, color: 'bg-purple-500', description: 'Learn voice navigation' },
          { title: 'Blockchain Security', icon: Shield, color: 'bg-green-500', description: 'How we protect you' },
          { title: 'Accessibility Guide', icon: Eye, color: 'bg-blue-500', description: 'Features for everyone' },
          { title: 'Global Support', icon: Globe, color: 'bg-orange-500', description: 'Multi-language help' }
        ].map((card, index) => (
          <motion.div
            key={card.title}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
              <card.icon size={20} className="text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{card.title}</h3>
            <p className="text-sm text-gray-600">{card.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Category Filter */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
          <p className="text-gray-600 mt-1">{filteredFAQs.length} articles found</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredFAQs.map((faq, index) => (
            <motion.div
              key={index}
              className="p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
                <button
                  onClick={() => handleVoiceHelp(faq.answer)}
                  className="ml-4 p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  aria-label="Listen to answer"
                >
                  <Volume2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contact Support */}
      <motion.div
        className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl p-6 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Still need help?</h2>
          <p className="mb-4 opacity-90">Our support team is available 24/7 to assist you</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-2 rounded-lg transition-all">
              Contact Support
            </button>
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-2 rounded-lg transition-all flex items-center justify-center space-x-2">
              <span>Community Forum</span>
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Emergency Accessibility Notice */}
      <motion.div
        className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-start space-x-3">
          <Eye className="text-yellow-600 mt-1" size={20} />
          <div>
            <h3 className="font-medium text-yellow-800">Accessibility Emergency Support</h3>
            <p className="text-yellow-700 text-sm mt-1">
              If you're experiencing accessibility issues that prevent you from using the platform, 
              please contact our emergency accessibility hotline at <strong>1-800-LEND-ACCESS</strong> 
              for immediate assistance.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Help;