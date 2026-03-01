function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card text-center py-12">
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;
