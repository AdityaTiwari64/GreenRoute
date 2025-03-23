import { useGreenPoints } from '../contexts/GreenPointsContext';

export default function ParkingHistoryDisplay() {
  const { parkingHistory, loading } = useGreenPoints();

  // Helper function to format dates
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-dark">Your Parking History</h2>
        {loading && <span className="text-sm text-gray-500">Loading...</span>}
      </div>
      
      {parkingHistory.length > 0 ? (
        <div className="space-y-4">
          {parkingHistory.map((parking, index) => (
            <div 
              key={parking.id || index} 
              className={`border-l-4 p-4 ${
                parking.type === 'efficient' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">
                    {parking.location}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(parking.date || parking.recordedAt)}
                  </p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      parking.type === 'efficient' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-secondary/10 text-secondary'
                    }`}>
                      {parking.type === 'efficient' 
                        ? 'Smart Parking' 
                        : 'Standard Parking'}
                    </span>
                    
                    <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {parking.duration} minutes
                    </span>
                    
                    {parking.carNumber && (
                      <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        Car: {parking.carNumber}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">                  
                  {parking.pointsAwarded > 0 && (
                    <div className="mt-1 bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full inline-block">
                      +{parking.pointsAwarded} points
                    </div>
                  )}
                </div>
              </div>
              
              {parking.notes && (
                <p className="mt-2 text-sm text-gray-600 italic">
                  "{parking.notes}"
                </p>
              )}
            </div>
          ))}
        </div>
      ) : loading ? (
        <div className="py-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2.5"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <h3 className="text-lg font-medium mb-1">No parking records yet</h3>
          <p className="text-sm">
            Your parking history will appear here after you log your parking
          </p>
        </div>
      )}
    </div>
  );
} 