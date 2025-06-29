import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Award,
  Globe,
  Bot,
  Smartphone,
  CreditCard,
  FileCheck,
  UserCheck,
  DollarSign,
  Clock,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  ExternalLink,
  Heart,
  Lightbulb,
  Target
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

interface HomePageProps {
  onAuthClick: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onAuthClick }) => {
  const { user } = useAuth();

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <div className="absolute inset-0 bg-hero-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div 
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            <motion.div 
              className="flex items-center justify-center space-x-3 mb-8"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Vibe
                </h1>
                <p className="text-lg text-gray-600 font-medium">Lend, Borrow, Connect – Vibe!</p>
              </div>
            </motion.div>

            <motion.h2 
              className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              variants={fadeInUp}
            >
              The Future of
              <span className="block bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Student Lending
              </span>
            </motion.h2>

            <motion.p 
              className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Connect with students worldwide through secure peer-to-peer lending. 
              Powered by AI verification, blockchain security, and built for accessibility.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
              variants={fadeInUp}
            >
              {user ? (
                <Link
                  to="/feed"
                  className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  <span>Explore Loans</span>
                  <ArrowRight size={20} />
                </Link>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  <span>Start Vibing</span>
                  <ArrowRight size={20} />
                </button>
              )}
              
              <Link
                to="/help"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
              >
                <span>Learn More</span>
                <ExternalLink size={20} />
              </Link>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
              variants={fadeInUp}
            >
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                <Bot className="text-blue-500 mb-3" size={32} />
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Verification</h3>
                <p className="text-gray-600 text-sm">Gemini AI verifies documents and prescriptions instantly</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                <Shield className="text-green-500 mb-3" size={32} />
                <h3 className="font-semibold text-gray-900 mb-2">Blockchain Security</h3>
                <p className="text-gray-600 text-sm">Algorand blockchain ensures transparent, secure transactions</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                <Globe className="text-purple-500 mb-3" size={32} />
                <h3 className="font-semibold text-gray-900 mb-2">Global Accessibility</h3>
                <p className="text-gray-600 text-sm">Voice navigation, multi-language support, screen reader compatible</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Award Banner */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-3">
            <Award size={24} />
            <p className="font-semibold">
              🏆 Winner of Women World Banking's Fintech Innovation Challenge
            </p>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at Vibe
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <motion.div 
              className="text-center group"
              variants={fadeInUp}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <Shield className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Integrity</h3>
              <p className="text-gray-600 leading-relaxed">
                Highest standards of integrity in our processes and product design. 
                Our north star metric is your continued trust.
              </p>
            </motion.div>

            <motion.div 
              className="text-center group"
              variants={fadeInUp}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <Lightbulb className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-600 leading-relaxed">
                We set out to create innovative products that are not just different 
                but also sector-defining. Generating high, impactful returns.
              </p>
            </motion.div>

            <motion.div 
              className="text-center group"
              variants={fadeInUp}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <Heart className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Our investment products deliver outcomes that align with your values 
                of progress and purpose. These values bind our community into a force of good.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Start Lending in a Few Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of students helping each other achieve their dreams
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <motion.div 
              className="text-center relative"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                1
              </div>
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <UserCheck className="text-blue-500 mb-4 mx-auto" size={32} />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Setup Account</h3>
                <p className="text-gray-600 text-sm">
                  KYC Verification - Aadhaar, PAN, Bank account
                </p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block absolute top-8 -right-4 text-gray-300">
                <ArrowRight size={24} />
              </div>
            </motion.div>

            <motion.div 
              className="text-center relative"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                2
              </div>
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <CreditCard className="text-green-500 mb-4 mx-auto" size={32} />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Add Funds</h3>
                <p className="text-gray-600 text-sm">
                  UPI or bank transfer
                </p>
              </div>
              <div className="hidden md:block absolute top-8 -right-4 text-gray-300">
                <ArrowRight size={24} />
              </div>
            </motion.div>

            <motion.div 
              className="text-center relative"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                3
              </div>
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <FileCheck className="text-purple-500 mb-4 mx-auto" size={32} />
                <h3 className="text-xl font-bold text-gray-900 mb-3">All Set</h3>
                <p className="text-gray-600 text-sm">
                  E-Sign Terms and conditions
                </p>
              </div>
              <div className="hidden md:block absolute top-8 -right-4 text-gray-300">
                <ArrowRight size={24} />
              </div>
            </motion.div>

            <motion.div 
              className="text-center"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                4
              </div>
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <Users className="text-orange-500 mb-4 mx-auto" size={32} />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Select Borrowers</h3>
                <p className="text-gray-600 text-sm">
                  See available loans
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            {user ? (
              <Link
                to="/feed"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span>Start Lending</span>
                <ArrowRight size={20} />
              </Link>
            ) : (
              <button
                onClick={onAuthClick}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span>Start Lending</span>
                <ArrowRight size={20} />
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Start Earning Section */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-teal-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <TrendingUp className="mx-auto mb-6" size={64} />
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Start Earning Today</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Join thousands of students earning passive income while helping their peers achieve their dreams. 
              Average returns of 8-12% annually with AI-verified borrowers.
            </p>
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-2 bg-white text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <DollarSign size={20} />
                <span>View Dashboard</span>
              </Link>
            ) : (
              <button
                onClick={onAuthClick}
                className="inline-flex items-center space-x-2 bg-white text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <DollarSign size={20} />
                <span>Start Earning</span>
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* News & Announcements */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">News & Announcements</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay updated with the latest from Vibe and the fintech world
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <motion.article 
              className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              variants={fadeInUp}
            >
              <img 
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop" 
                alt="Women World Banking Award"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Meet the winner of Women World Banking's Fintech Innovation Challenge
                </h3>
                <p className="text-gray-600 text-sm">
                  Vibe wins prestigious award for innovative approach to student lending and financial inclusion.
                </p>
              </div>
            </motion.article>

            <motion.article 
              className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              variants={fadeInUp}
            >
              <img 
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop" 
                alt="Rural Women Entrepreneurs"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How an Entrepreneur is Closing the Loan Gap for Rural Women
                </h3>
                <p className="text-gray-600 text-sm">
                  Helping thousands start businesses through accessible P2P lending solutions.
                </p>
              </div>
            </motion.article>

            <motion.article 
              className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              variants={fadeInUp}
            >
              <img 
                src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop" 
                alt="Credit Growth Report"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Women outpaced men in credit uptake by 17.8% in CY23: Report
                </h3>
                <p className="text-gray-600 text-sm">
                  Latest industry report shows significant growth in women's participation in credit markets.
                </p>
              </div>
            </motion.article>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              What Our Investors Say About Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from real people who are vibing with us
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            {[
              {
                name: "Pradeep J",
                role: "Retired Army",
                content: "Easy and simple investment. Great way to create a second, monthly income.",
                rating: 5
              },
              {
                name: "Sapan",
                role: "Data Lead",
                content: "I like the transparency in stating returns in APR or per annum basis. No misleading IRRs or fancy return calculations.",
                rating: 5
              },
              {
                name: "Manish Jasyal",
                role: "Product Manager",
                content: "I am a conservative investor and Vibe worked for me because of being RBI regulated and easy to understand.",
                rating: 5
              },
              {
                name: "Adil",
                role: "Musician",
                content: "Seeing returns hit my bank account every month makes me smile. Please launch your mobile app soon.",
                rating: 5
              },
              {
                name: "Sunanda G.",
                role: "Professional",
                content: "My investment corpus automatically increases every month with the growth plan and enables more borrowers.",
                rating: 5
              },
              {
                name: "Luv N.",
                role: "Consultant",
                content: "A purposeful investment that doubles up as a passive income stream.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-soft border border-gray-100"
                variants={fadeInUp}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We've got answers to help you vibe with confidence.
            </p>
          </motion.div>

          <motion.div 
            className="space-y-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            {[
              {
                category: "Lender FAQs",
                questions: [
                  "How do I start lending on Vibe?",
                  "What returns can I expect?",
                  "How is my investment secured?"
                ]
              },
              {
                category: "Quick Explainers",
                questions: [
                  "How does P2P lending work?",
                  "What is blockchain security?",
                  "How does AI verification work?"
                ]
              },
              {
                category: "For Borrowers",
                questions: [
                  "How do I apply for a loan?",
                  "What documents do I need?",
                  "How quickly can I get funded?"
                ]
              }
            ].map((section, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 rounded-xl p-6"
                variants={fadeInUp}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">{section.category}</h3>
                <div className="space-y-2">
                  {section.questions.map((question, qIndex) => (
                    <div key={qIndex} className="flex items-center space-x-2 text-gray-600">
                      <CheckCircle className="text-green-500" size={16} />
                      <span>{question}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <p className="text-gray-600 mb-6">Still have a question?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                <Phone size={20} />
                <span>Book a call</span>
              </button>
              <Link 
                to="/help"
                className="inline-flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink size={20} />
                <span>Help Center</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Start Your Vibe Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of students who are already lending, borrowing, and connecting on Vibe.
            </p>
            {user ? (
              <Link
                to="/feed"
                className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Zap size={20} />
                <span>Explore Loans</span>
              </Link>
            ) : (
              <button
                onClick={onAuthClick}
                className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Zap size={20} />
                <span>Get Started</span>
              </button>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;