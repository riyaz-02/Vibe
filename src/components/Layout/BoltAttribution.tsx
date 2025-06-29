import React from 'react';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const BoltAttribution: React.FC = () => {
  return (
    <motion.div
      className="fixed bottom-4 left-4 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2, duration: 0.5 }}
    >
      <motion.a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
          <ExternalLink size={12} className="text-purple-600" />
        </div>
        <span>Powered by Bolt.new</span>
      </motion.a>
    </motion.div>
  );
};

export default BoltAttribution;