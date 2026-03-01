import React from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Briefcase, FileText, Search, Inbox } from 'lucide-react';

;
}

export const EmptyState = ({
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
    <LazyMotion features={domAnimation}>
      <m.div
      initial={{ opacity)}
    </m.div>
    </LazyMotion>
  );
};


