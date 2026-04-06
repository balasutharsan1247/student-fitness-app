const LifestyleScoreCard = ({ score }) => {
  // Determine color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-green-';
    if (score >= 40) return 'text-green-';
    return 'text-green-';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  // Calculate circle progress
  const circumference = 2 * Math.PI * 70; // radius = 70
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="card-dark rounded-xl shadow-dark p-6">
      <h3 className="text-lg font-semibold text-dark mb-6">
        Today's Lifestyle Score
      </h3>

      <div className="flex flex-col items-center">
        {/* Circular Progress */}
        <div className="relative w-48 h-48">
          <svg className="transform -rotate-90 w-48 h-48">
            {/* Background circle */}
            <circle
              cx="96"
              cy="96"
              r="70"
              stroke="currentColor"
              className="text-gray-200 dark:text-dark-border"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="96"
              cy="96"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`${scoreColor} transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          </svg>

          {/* Score in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${scoreColor}`}>
              {score}
            </span>
            <span className="text-muted-dark text-sm mt-1">out of 100</span>
          </div>
        </div>

        {/* Score label */}
        <div className="mt-6 text-center">
          <p className={`text-xl font-semibold ${scoreColor}`}>
            {scoreLabel}
          </p>
          <p className="text-sm text-muted-dark mt-1">
            Keep up the great work! 💪
          </p>
        </div>
      </div>
    </div>
  );
};

export default LifestyleScoreCard;