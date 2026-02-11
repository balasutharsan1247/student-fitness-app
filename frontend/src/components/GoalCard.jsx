import { Target, TrendingUp } from 'lucide-react';

const GoalCard = ({ goal }) => {
  const progressPercent = goal.progress || 0;
  
  // Determine color based on progress
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const progressColor = getProgressColor(progressPercent);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Target className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">
              {goal.title}
            </h4>
            <p className="text-xs text-gray-500">
              {goal.category}
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
          {goal.status}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600">Progress</span>
          <span className="text-xs font-semibold text-gray-900">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${progressColor} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>
          {goal.currentValue} / {goal.targetValue} {goal.unit}
        </span>
        {goal.points > 0 && (
          <span className="flex items-center space-x-1 text-yellow-600">
            <TrendingUp className="w-3 h-3" />
            <span>{goal.points} pts</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default GoalCard;