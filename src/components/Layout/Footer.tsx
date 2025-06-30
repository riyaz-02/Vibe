import React from 'react';
import { ExternalLink, Shield, Globe, Accessibility, Zap, Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';

const Footer: React.FC = () => {
  const { currentLanguage } = useStore();
  const t = useTranslation(currentLanguage);

  const rbiDisclaimer = "Reserve Bank of India is not liable and does not accept any responsibility for the correctness of any of the statements or representations made or opinions expressed by Vibe, and does not assure of repayments of the loans lent on it. • Vibe is an Intermediary under the provisions of the Information Technology Act, 1999 and virtually connects lenders and borrowers through its website and mobile applications. The loan transaction is between lenders and borrowers at their own discretion and Vibe is neither party to the transaction nor does it provide any assurance or guarantee of loan disbursement to borrowers or returns to the lenders. • RBI Registration: The Company is having a valid Certificate of Registration dated March 1, 2021 issued by the Reserve Bank of India under section 45 IA of the Reserve Bank of India Act, 1934. RBI COR No: N.13-02409 dated 01/03/2021";

  return (
    <>
      {/* RBI Disclaimer Marquee */}
      <div className="bg-yellow-50 border-t border-yellow-200 py-3 overflow-hidden">
        <div className="whitespace-nowrap animate-marquee">
          <span className="text-yellow-800 text-sm font-medium px-4">
            <strong>Disclaimer:</strong> {rbiDisclaimer}
          </span>
        </div>
      </div>

      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="https://i.postimg.cc/3NkJPPCj/4310527d-e957-40f6-b9e8-eefdb06219f3-1.png" 
                  alt="Vibe Logo" 
                  className="h-12 w-auto"
                />
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                    {t('app.title')}
                  </span>
                  <p className="text-sm text-gray-300 mt-1">{t('app.tagline')}</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                Connecting students globally through peer-to-peer lending. Secure, accessible, and built for the future of finance.
              </p>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
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
              <ul className="space-y-2 text-gray-300 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Chatbot</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Accessibility</a></li>
              </ul>
            </div>
            
            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fair Practices Code</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Grievance Policy</a></li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone size={14} />
                  <span>022 65027681</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail size={14} />
                  <span>info@vibe.com</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin size={14} className="mt-0.5" />
                  <span>Block A, Kalyani, District: Nadia, West Bengal, India, Pin 741235</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-6 mb-4 md:mb-0">
                <span className="text-gray-400 text-sm">
                  © 2025 Vibe. P2P Lending and Burrowing Platform
                </span>
              </div>
              
              <div className="flex items-center space-x-6">
                {/* Social Links */}
                <div className="flex items-center space-x-3">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Facebook size={18} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Twitter size={18} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Linkedin size={18} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Instagram size={18} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Youtube size={18} />
                  </a>
                </div>
                
                {/* Compliance Badges */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-green-400">
                    <Shield size={14} />
                    <span className="text-xs">RBI Regulated</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-blue-400">
                    <Globe size={14} />
                    <span className="text-xs">Algorand Secured</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-purple-400">
                    <Accessibility size={14} />
                    <span className="text-xs">WCAG 2.1 AA</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center text-gray-400 text-xs">
              <p className="mt-4 font-medium">
                Built with ❤️ for students worldwide
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;