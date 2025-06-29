import React from 'react';
import { CheckCircle, Shield, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface VerificationBadgeProps {
  type: 'identity' | 'medical' | 'document';
  status: 'verified' | 'pending' | 'rejected' | 'none';
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  type,
  status,
  confidence,
  size = 'md',
  showLabel = false
}) => {
  const getIcon = () => {
    switch (status) {
      case 'verified':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'rejected':
        return AlertCircle;
      default:
        return Shield;
    }
  };

  const getColor = () => {
    switch (status) {
      case 'verified':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'text-red-500 bg-red-50 border-red-200';
      default:
        return 'text-gray-400 bg-gray-50 border-gray-200';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const getLabel = () => {
    const labels = {
      identity: 'ID Verified',
      medical: 'Medical Verified',
      document: 'Document Verified'
    };
    return labels[type];
  };

  const Icon = getIcon();

  if (!showLabel) {
    return (
      <motion.div
        className={`inline-flex items-center justify-center rounded-full border ${getColor()} ${getSize()}`}
        whileHover={{ scale: 1.1 }}
        title={`${getLabel()} - ${status}${confidence ? ` (${Math.round(confidence * 100)}% confidence)` : ''}`}
      >
        <Icon size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getColor()}`}
      whileHover={{ scale: 1.02 }}
    >
      <Icon size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />
      <span className={`font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {getLabel()}
      </span>
      {confidence && status === 'verified' && (
        <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} opacity-75`}>
          ({Math.round(confidence * 100)}%)
        </span>
      )}
    </motion.div>
  );
};

export default VerificationBadge;