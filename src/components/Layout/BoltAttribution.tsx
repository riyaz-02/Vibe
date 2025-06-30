import React from 'react';
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
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img 
          src="https://i.postimg.cc/sXmWMsSY/black-circle-360x360.png" 
          alt="Bolt Icon" 
          className="w-16 h-16 rounded-full object-cover shadow-lg hover:shadow-xl transition-shadow duration-200"
        />
      </motion.a>
    </motion.div>
  );
};

export default BoltAttribution;