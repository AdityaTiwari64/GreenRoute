import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getUserPointsHistory,
  getUserTripHistory,
  getUserParkingHistory, 
  addGreenPoints, 
  registerUserVehicle,
  recordParking
} from '../lib/firebase';

const GreenPointsContext = createContext();

export const useGreenPoints = () => useContext(GreenPointsContext);

export const GreenPointsProvider = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const [pointsHistory, setPointsHistory] = useState([]);
  const [tripHistory, setTripHistory] = useState([]);
  const [parkingHistory, setParkingHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's points history when user changes
  useEffect(() => {
    const fetchPointsHistory = async () => {
      if (!currentUser) {
        setPointsHistory([]);
        return;
      }

      setLoading(true);
      try {
        const { history, error } = await getUserPointsHistory(currentUser.uid);
        if (history) {
          // Sort by timestamp desc
          const sortedHistory = history.sort((a, b) => 
            b.timestamp?.toDate() - a.timestamp?.toDate()
          );
          setPointsHistory(sortedHistory);
        }
        if (error) setError(error);
      } catch (err) {
        console.error("Error fetching points history:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPointsHistory();
  }, [currentUser]);

  // Fetch trip history when user changes
  useEffect(() => {
    const fetchTripHistory = async () => {
      if (!currentUser) {
        setTripHistory([]);
        return;
      }

      setLoading(true);
      try {
        const { trips, error } = await getUserTripHistory(currentUser.uid);
        if (trips) {
          setTripHistory(trips);
        }
        if (error) {
          console.error("Error in trip history:", error);
          setError(error);
        }
      } catch (err) {
        console.error("Error fetching trip history:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTripHistory();
  }, [currentUser]);

  // Fetch parking history when user changes
  useEffect(() => {
    const fetchParkingHistory = async () => {
      if (!currentUser) {
        setParkingHistory([]);
        return;
      }

      setLoading(true);
      try {
        const { parking, error } = await getUserParkingHistory(currentUser.uid);
        if (parking) {
          setParkingHistory(parking);
        }
        if (error) {
          console.error("Error in parking history:", error);
          setError(error);
        }
      } catch (err) {
        console.error("Error fetching parking history:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchParkingHistory();
  }, [currentUser]);

  // Register a vehicle and earn points based on type
  const registerVehicle = async (vehicleData) => {
    if (!currentUser) return { success: false, error: "User not authenticated" };
    
    setLoading(true);
    try {
      const result = await registerUserVehicle(currentUser.uid, vehicleData);
      return result;
    } catch (err) {
      console.error("Error registering vehicle:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Record parking and earn points if efficient
  const logParking = async (parkingData) => {
    if (!currentUser) return { success: false, error: "User not authenticated" };
    
    setLoading(true);
    try {
      const result = await recordParking(currentUser.uid, parkingData);
      
      // If successful, update the local parking history
      if (result.success) {
        const { parking } = await getUserParkingHistory(currentUser.uid);
        if (parking) {
          setParkingHistory(parking);
        }
      }
      
      return result;
    } catch (err) {
      console.error("Error recording parking:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Add points manually (for special achievements, etc.)
  const awardPoints = async (points, reason) => {
    if (!currentUser) return { success: false, error: "User not authenticated" };
    
    setLoading(true);
    try {
      const result = await addGreenPoints(currentUser.uid, points, reason);
      return result;
    } catch (err) {
      console.error("Error awarding points:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    greenPoints: userProfile?.greenPoints || 0,
    pointsHistory,
    tripHistory,
    parkingHistory,
    loading,
    error,
    registerVehicle,
    logParking,
    awardPoints
  };

  return (
    <GreenPointsContext.Provider value={value}>
      {children}
    </GreenPointsContext.Provider>
  );
}; 