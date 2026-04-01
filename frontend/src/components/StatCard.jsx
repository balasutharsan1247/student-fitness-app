const StatCard = ({ icon: Icon, label, value, unit, color, target, progress }) => {
  return (
    <div className="card-dark rounded-xl shadow-md dark:shadow-lg p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {progress !== undefined && (
          <span className="text-sm font-medium text-gray-600 dark:text-dark-muted">
            {progress}%
          </span>
        )}
      </div>
      <h3 className="text-gray-600 dark:text-dark-muted text-sm font-medium mb-1">{label}</h3>
      <div className="flex items-baseline space-x-2">
        <p className="text-3xl font-bold text-dark">{value}</p>
        {unit && <span className="text-gray-500 dark:text-dark-muted text-sm">{unit}</span>}
      </div>
      {target && (
        <p className="text-xs text-gray-500 dark:text-dark-muted mt-2">
          Target: {target} {unit}
        </p>
      )}
    </div>
  );
};

export default StatCard;