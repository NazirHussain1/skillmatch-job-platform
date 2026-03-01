import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, FileText, Search, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'briefcase' | 'file' | 'search' | 'inbox';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  action
}) => {
  const icons = {
    briefcase: Briefcase,
    file: FileText,
    search: Search,
    inbox: Inbox
  };

  const Icon = icons[icon];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Enhanced icon with gradient background */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="relative mb-8"
      >
        {/* Outer glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
        
        {/* Icon container */}
        <div className="relative w-32 h-32 bg-gradient-to-br from-primary-50 to-purple-50 rounded-full flex items-center justify-center shadow-xl">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center">
            <Icon className="w-12 h-12 text-primary-600" />
          </div>
        </div>
        
        {/* Decorative dots */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary-400 rounded-full animate-bounce"></div>
        <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </motion.div>

      <motion.h3 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-gray-900 mb-3"
      >
        {title}
      </motion.h3>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-gray-600 mb-8 max-w-md leading-relaxed"
      >
        {description}
      </motion.p>
      
      {action && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="px-8 py-3.5 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
};
