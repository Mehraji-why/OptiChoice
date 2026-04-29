export default function ResultCard({ rank, option, title, color = 'neutral' }) {
  const colorClasses = {
    success: 'card-success border-[#10b981]',
    warning: 'card-warning border-[#f59e0b]',
    danger: 'card-danger border-[#ef4444]',
    neutral: '',
  };

  const badgeClasses = {
    success: 'bg-[#10b981]',
    warning: 'bg-[#f59e0b]',
    danger: 'bg-[#ef4444]',
    neutral: 'bg-gray-400',
  };

  return (
    <div className={`card ${colorClasses[color]}`}>
      <div className="mb-4">
        <span className={`${badgeClasses[color]} text-white px-3 py-1 rounded-full text-sm font-medium`}>
          {rank}
        </span>
      </div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <div className="bg-gray-100 rounded p-4">
        <p className="text-gray-700 text-sm mb-2">
          <strong>Option:</strong> {option.option}
        </p>
        <p className="text-gray-700 text-sm mb-2">
          <strong>Overall Score:</strong> {(option.overall_score * 100).toFixed(1)}%
        </p>
        <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
          <strong>Reasoning:</strong> {option.reason}
        </p>
      </div>
      {Object.entries(option.priority_scores || {}).length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-900 mb-2">Priority Breakdown:</h4>
          <div className="space-y-1">
            {Object.entries(option.priority_scores).map(([priority, score]) => (
              <div key={priority} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 capitalize">{priority}:</span>
                <span className="font-medium text-gray-900">{score}/10</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
