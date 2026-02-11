const StatCard = ({ icon: Icon, label, value, unit, color, target, progress }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {progress !== undefined && (
          <span className="text-sm font-medium text-gray-600">
            {progress}%
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{label}</h3>
      <div className="flex items-baseline space-x-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {unit && <span className="text-gray-500 text-sm">{unit}</span>}
      </div>
      {target && (
        <p className="text-xs text-gray-500 mt-2">
          Target: {target} {unit}
        </p>
      )}
    </div>
  );
};

export default StatCard;