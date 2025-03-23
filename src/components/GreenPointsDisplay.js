import { useGreenPoints } from '../contexts/GreenPointsContext';
import { useAuth } from '../contexts/AuthContext';

export default function GreenPointsDisplay() {
  const { greenPoints, pointsHistory, loading } = useGreenPoints();
  const { getUserProfile } = useAuth();
  const userProfile = getUserProfile();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-dark">Green Points</h2>
        {loading && <span className="text-sm text-gray-500">Updating...</span>}
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="bg-primary/10 rounded-full p-6 relative">
          <div className="text-4xl font-bold text-primary text-center">
            {greenPoints}
          </div>
          <div className="text-sm text-gray-600 text-center mt-1">points</div>
        </div>
      </div>

      {pointsHistory.length > 0 ? (
        <div>
          <h3 className="text-md font-semibold mb-2">Recent Activity</h3>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {pointsHistory.slice(0, 5).map((entry, index) => (
              <li key={entry.id || index} className="border-b border-gray-100 pb-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{entry.reason}</span>
                  <span className={`font-semibold ${entry.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.points > 0 ? '+' : ''}{entry.points}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {entry.timestamp?.toDate ? 
                    entry.timestamp.toDate().toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) 
                    : 'Recent'}
                </div>
              </li>
            ))}
          </ul>
          {pointsHistory.length > 5 && (
            <div className="text-center mt-3">
              <a href="/points-history" className="text-sm text-primary hover:text-primary/80">
                View All Activity
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          <p>No points activity yet</p>
          <p className="text-sm mt-1">Complete eco-friendly actions to earn points!</p>
        </div>
      )}
    </div>
  );
} 