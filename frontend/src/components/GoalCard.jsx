import { Target, TrendingUp } from 'lucide-react';

const GoalCard = ({ goal }) => {
  const progressPercent = goal.progress || 0;
  
  // Determine color based on progress
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-green-300';
    return 'bg-green-200';
  };

  const progressColor = getProgressColor(progressPercent);

  return (
    <div className="card-dark rounded-lg p-4 hover:shadow-dark transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-dark text-sm">
              {goal.title}
            </h4>
            <p className="text-xs text-muted-dark">
              {goal.category}
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
          {goal.status}
        </span>
      </div>
      <div className="mb-2">
        <span className="text-[11px] font-medium px-2 py-1 rounded bg-gray-100 dark:bg-dark-hover text-muted-dark">
          {goal.verificationType === 'confirmable' ? 'Confirmable' : 'Auto-verifiable'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-dark">Progress</span>
          <span className="text-xs font-semibold text-dark">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2">
          <div
            className={`${progressColor} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-dark">
        <span>
          {goal.verificationType === 'confirmable'
            ? 'Needs self-confirmation note'
            : 'Auto-tracked from logs'}
        </span>
        {goal.points > 0 && (
          <span className="flex items-center space-x-1 text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span>{goal.points} pts</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default GoalCard;