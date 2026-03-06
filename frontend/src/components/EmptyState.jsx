import { Briefcase, Search, FileText, Inbox } from 'lucide-react';

const EmptyState = ({ 
  type = 'jobs', 
  title, 
  description, 
  action, 
  onAction 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'jobs':
        return <Briefcase className="w-20 h-20 text-gray-300" strokeWidth={1.5} />;
      case 'search':
        return <Search className="w-20 h-20 text-gray-300" strokeWidth={1.5} />;
      case 'applications':
        return <FileText className="w-20 h-20 text-gray-300" strokeWidth={1.5} />;
      case 'inbox':
        return <Inbox className="w-20 h-20 text-gray-300" strokeWidth={1.5} />;
      default:
        return <Briefcase className="w-20 h-20 text-gray-300" strokeWidth={1.5} />;
    }
  };
  
  const getDefaultContent = () => {
    switch (type) {
      case 'jobs':
        return {
          title: 'No jobs found',
          description: 'Try adjusting your search filters or check back later for new opportunities'
        };
      case 'search':
        return {
          title: 'No results found',
          description: 'Try different keywords or filters to find what you\'re looking for'
        };
      case 'applications':
        return {
          title: 'No applications yet',
          description: 'Start applying to jobs to see them here'
        };
      case 'inbox':
        return {
          title: 'No messages',
          description: 'Your inbox is empty'
        };
      default:
        return {
          title: 'Nothing here',
          description: 'There\'s nothing to show right now'
        };
    }
  };
  
  const content = {
    title: title || getDefaultContent().title,
    description: description || getDefaultContent().description
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-full p-8 mb-6">
        {getIcon()}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {content.title}
      </h3>
      <p className="text-gray-600 text-center max-w-md mb-6">
        {content.description}
      </p>
      {action && onAction && (
        <button onClick={onAction} className="btn-primary">
          {action}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
