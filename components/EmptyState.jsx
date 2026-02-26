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
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6"
      >
        <Icon className="w-12 h-12 text-blue-500" />
      </motion.div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      {action && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
};
