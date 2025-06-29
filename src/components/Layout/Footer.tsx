import React from 'react';
import { ExternalLink, Shield, Globe, Accessibility, Zap } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';

const Footer: React.FC = () => {
  const { currentLanguage } = useStore();
  const t = useTranslation(currentLanguage);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  {t('app.title')}
                </span>
                <p className="text-sm text-gray-300 mt-1">{t('app.tagline')}</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Connecting students globally through peer-to-peer lending. Secure, accessible, and built for the future of finance with AI-powered verification and blockchain security.
            </p>
            
            {/* Built with Bolt.new Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-full">
              <ExternalLink size={16} />
              <span className="text-sm font-medium">{t('built_with_bolt')}</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Verification</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safety & Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blockchain Explorer</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Chatbot</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community Guidelines</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Accessibility</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <span className="text-gray-400 text-sm">
                © 2024 Vibe. Platform fee: 1-2%. Lending involves risks.
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Compliance Badges */}
              <div className="flex items-center space-x-1 text-green-400">
                <Shield size={16} />
                <span className="text-xs">GDPR/RBI Compliant</span>
              </div>
              
              <div className="flex items-center space-x-1 text-blue-400">
                <Globe size={16} />
                <span className="text-xs">Algorand Secured</span>
              </div>
              
              <div className="flex items-center space-x-1 text-purple-400">
                <Accessibility size={16} />
                <span className="text-xs">WCAG 2.1 AA</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center text-gray-400 text-xs">
            <p>Disclaimer: Peer-to-peer lending involves risks. Assess loan viability carefully. We are not a bank or financial institution.</p>
            <p className="mt-1">Powered by Gemini AI • Secured by Algorand Blockchain • Built with ❤️ for students worldwide</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;