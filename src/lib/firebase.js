// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCohKVwJMMiMd4HMj9KCobhLkNR0_GUbIw",
  authDomain: "green-route-58b67.firebaseapp.com",
  projectId: "green-route-58b67",
  storageBucket: "green-route-58b67.firebasestorage.app",
  messagingSenderId: "155676635789",
  appId: "1:155676635789:web:72cf28e4eb3caf96e6e8c4",
  measurementId: "G-NSQGN03C6N"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
export const GoogleProvider = new GoogleAuthProvider();
export { app, auth, db };

// Authentication helper functions
export const registerUser = async (email, password, profileData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile with initial green points
    await createUserProfile(userCredential.user.uid, {
      email,
      displayName: profileData.displayName || email.split('@')[0],
      ...profileData
    });
    
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
export const signinwithgoogle = async () => {
  try {
    const result = await signInWithPopup(auth, GoogleProvider);
    
    if (!result || !result.user) {
      console.error("No user returned from Google authentication");
      return { user: null, error: "Authentication failed. No user data returned." };
    }
    
    try {
      // Check if this is first login and create profile if needed
      const { profile, error: profileError } = await getUserProfile(result.user.uid);
      
      if (profileError) {
        console.error("Error checking user profile:", profileError);
      }
      
      if (!profile) {
        const { success, error: createError } = await createUserProfile(result.user.uid, {
          email: result.user.email,
          displayName: result.user.displayName || result.user.email.split('@')[0],
          photoURL: result.user.photoURL
        });
        
        if (!success) {
          console.error("Error creating user profile:", createError);
          // Continue even if profile creation fails - user is still authenticated
        }
      }
      
      return { user: result.user, error: null };
    } catch (profileErr) {
      console.error("Error in profile handling:", profileErr);
      // Still return the user as authentication succeeded
      return { user: result.user, error: null };
    }
  } catch (err) {
    console.error("Google authentication error:", err);
    
    // Handle different authentication errors
    let errorMessage = err.message;
    if (err.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in popup was closed before completing the sign-in.';
    } else if (err.code === 'auth/popup-blocked') {
      errorMessage = 'Sign-in popup was blocked by the browser. Please allow popups for this site.';
    }
    
    return { user: null, error: errorMessage };
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

// Profile and Green Points functions
export const createUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      ...profileData,
      greenPoints: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, error: null };
  } catch (error) {
    console.error("Error creating user profile:", error);
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { profile: userSnap.data(), error: null };
    } else {
      return { profile: null, error: "User profile not found" };
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { profile: null, error: error.message };
  }
};

export const updateUserProfile = async (userId, updateData) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message };
  }
};

// Green Points System
export const addGreenPoints = async (userId, points, reason) => {
  try {
    // Update user's total points
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      greenPoints: increment(points),
      updatedAt: serverTimestamp(),
    });
    
    // Log the points transaction
    const pointsLogRef = collection(db, "users", userId, "pointsLog");
    await addDoc(pointsLogRef, {
      points,
      reason,
      timestamp: serverTimestamp(),
    });
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error adding green points:", error);
    return { success: false, error: error.message };
  }
};

export const getUserPointsHistory = async (userId) => {
  try {
    const pointsCollection = collection(db, "users", userId, "pointsLog");
    const pointsSnapshot = await getDocs(pointsCollection);
    const pointsHistory = [];
    
    pointsSnapshot.forEach((doc) => {
      pointsHistory.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return { history: pointsHistory, error: null };
  } catch (error) {
    console.error("Error fetching points history:", error);
    return { history: [], error: error.message };
  }
};

// Car Registration System
export const registerUserVehicle = async (userId, vehicleData) => {
  try {
    const vehicleRef = collection(db, "users", userId, "vehicles");
    await addDoc(vehicleRef, {
      ...vehicleData,
      registeredAt: serverTimestamp(),
    });
    
    // Award points for registering an eco-friendly vehicle
    if (vehicleData.type === 'electric') {
      await addGreenPoints(userId, 100, 'Registered electric vehicle');
    } else if (vehicleData.type === 'hybrid') {
      await addGreenPoints(userId, 50, 'Registered hybrid vehicle');
    } else if (vehicleData.type === 'fuelEfficient') {
      await addGreenPoints(userId, 25, 'Registered fuel-efficient vehicle');
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error registering vehicle:", error);
    return { success: false, error: error.message };
  }
};

// Travel and Carpooling System
export const recordTrip = async (userId, tripData, isVerified = false) => {
  try {
    const tripRef = collection(db, "users", userId, "trips");
    
    // Add the trip with pending approval status if not verified
    const tripStatus = isVerified ? 'completed' : 'pending';
    
    const newTrip = await addDoc(tripRef, {
      ...tripData,
      status: tripStatus,
      recordedAt: serverTimestamp(),
    });
    
    // If the trip is already verified, award points immediately
    if (isVerified) {
      await awardTripPoints(userId, newTrip.id, tripData);
    }
    
    return { 
      success: true, 
      tripId: newTrip.id,
      error: null 
    };
  } catch (error) {
    console.error("Error recording trip:", error);
    return { success: false, error: error.message };
  }
};

// Function to award points for a trip based on carpooling and distance
export const awardTripPoints = async (userId, tripId, tripData) => {
  try {
    // No points for non-carpool trips
    if (!tripData.isCarpool) {
      return { success: true, points: 0, error: null };
    }
    
    // Calculate points based on carpooling details
    let points = 0;
    const distance = tripData.distance || 0;
    
    // Award 5 points per passenger per 10 km
    if (tripData.passengers && tripData.passengers > 0) {
      const passengerPoints = Math.floor((distance / 10) * 5 * tripData.passengers);
      points += passengerPoints;
    }
    
    // Award points as long as there's at least 1 point earned
    if (points > 0) {
      // Award points and record the reason
      const reason = `Carpool trip with ${tripData.passengers} passenger(s) for ${distance}km`;
      await addGreenPoints(userId, points, reason);
      
      // Update trip record with points info
      const tripRef = doc(db, "users", userId, "trips", tripId);
      await updateDoc(tripRef, {
        pointsAwarded: points,
        status: 'completed',
        updatedAt: serverTimestamp()
      });
      
      return { success: true, points, error: null };
    }
    
    return { success: true, points: 0, error: null };
  } catch (error) {
    console.error("Error awarding trip points:", error);
    return { success: false, points: 0, error: error.message };
  }
};

// Function to verify a pending trip
export const verifyTrip = async (userId, tripId) => {
  try {
    const tripRef = doc(db, "users", userId, "trips", tripId);
    const tripDoc = await getDoc(tripRef);
    
    if (!tripDoc.exists()) {
      return { success: false, error: "Trip not found" };
    }
    
    const tripData = tripDoc.data();
    
    // Only verify trips that are pending
    if (tripData.status !== 'pending') {
      return { 
        success: false, 
        error: `Trip is already in ${tripData.status} status`
      };
    }
    
    // Award points for the trip
    const { success, points, error } = await awardTripPoints(userId, tripId, tripData);
    
    if (!success) {
      return { success: false, error };
    }
    
    return { success: true, points, error: null };
  } catch (error) {
    console.error("Error verifying trip:", error);
    return { success: false, error: error.message };
  }
};

// Function to complete a ride with location verification
export const completeRide = async (rideId, driverId, passengerIds, distance) => {
  try {
    // Create a ride document with verification status
    const rideRef = doc(db, "rides", rideId);
    
    // Check if the ride already exists
    const rideDoc = await getDoc(rideRef);
    
    if (rideDoc.exists()) {
      // If ride already exists, check if it's already completed
      const rideData = rideDoc.data();
      if (rideData.status === 'completed') {
        return { 
          success: false, 
          error: "Ride has already been completed" 
        };
      }
      
      // Update the ride document with completion information
      await updateDoc(rideRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        driverVerified: true,
        passengerVerified: rideData.passengerVerified || [],
        completedBy: driverId,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create a new ride completion record
      await setDoc(rideRef, {
        id: rideId,
        driverId,
        passengerIds,
        distance,
        status: 'completed',
        completedAt: serverTimestamp(),
        driverVerified: true,
        passengerVerified: [],
        completedBy: driverId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    // Record the trip for the driver
    const driverTripData = {
      rideId,
      isDriver: true,
      isCarpool: passengerIds.length > 0,
      passengers: passengerIds.length,
      distance,
      startTime: new Date().toISOString(),
    };
    
    const driverResult = await recordTrip(driverId, driverTripData, true);
    
    if (!driverResult.success) {
      console.error("Error recording driver trip:", driverResult.error);
    }
    
    // Record trips for each passenger and award their points
    let passengerResults = [];
    for (const passengerId of passengerIds) {
      const passengerTripData = {
        rideId,
        isDriver: false,
        isCarpool: true,
        distance,
        startTime: new Date().toISOString(),
      };
      
      const result = await recordTrip(passengerId, passengerTripData, true);
      passengerResults.push(result);
      
      if (!result.success) {
        console.error(`Error recording trip for passenger ${passengerId}:`, result.error);
      }
    }
    
    return { 
      success: true, 
      driverResult,
      passengerResults,
      error: null 
    };
  } catch (error) {
    console.error("Error completing ride:", error);
    return { success: false, error: error.message };
  }
};

// Function to verify passenger location for a ride
export const verifyPassengerLocation = async (rideId, passengerId) => {
  try {
    const rideRef = doc(db, "rides", rideId);
    const rideDoc = await getDoc(rideRef);
    
    if (!rideDoc.exists()) {
      return { 
        success: false, 
        error: "Ride not found" 
      };
    }
    
    const rideData = rideDoc.data();
    
    // Check if passenger is part of this ride
    if (!rideData.passengerIds.includes(passengerId)) {
      return { 
        success: false, 
        error: "Passenger is not part of this ride" 
      };
    }
    
    // Check if passenger already verified location
    if (rideData.passengerVerified && rideData.passengerVerified.includes(passengerId)) {
      return { 
        success: true, 
        message: "Passenger already verified location",
        error: null 
      };
    }
    
    // Add passenger to verified list
    const updatedPassengerVerified = [...(rideData.passengerVerified || []), passengerId];
    
    await updateDoc(rideRef, {
      passengerVerified: updatedPassengerVerified,
      updatedAt: serverTimestamp()
    });
    
    return { 
      success: true, 
      message: "Passenger location verified",
      error: null 
    };
  } catch (error) {
    console.error("Error verifying passenger location:", error);
    return { success: false, error: error.message };
  }
};

// Function for recording parking data
export const recordParking = async (userId, parkingData) => {
  try {
    const parkingRef = collection(db, "users", userId, "parking");
    
    // Add parking record
    const newParking = await addDoc(parkingRef, {
      ...parkingData,
      recordedAt: serverTimestamp(),
    });
    
    // Award points if it's efficient parking
    let points = 0;
    if (parkingData.type === 'efficient') {
      points = 10; // 10 points for efficient parking
      await addGreenPoints(userId, points, 'Used efficient/smart parking');
      
      // Update parking record with points info
      await updateDoc(doc(parkingRef, newParking.id), {
        pointsAwarded: points
      });
    }
    
    return { 
      success: true, 
      parkingId: newParking.id,
      points,
      error: null 
    };
  } catch (error) {
    console.error("Error recording parking:", error);
    return { success: false, error: error.message };
  }
};

// Fetch user's trip history
export const getUserTripHistory = async (userId) => {
  try {
    const tripsCollection = collection(db, "users", userId, "trips");
    const tripsSnapshot = await getDocs(tripsCollection);
    const trips = [];
    
    tripsSnapshot.forEach((doc) => {
      trips.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    // Sort by timestamp desc
    const sortedTrips = trips.sort((a, b) => {
      const dateA = a.recordedAt?.toDate() || new Date(0);
      const dateB = b.recordedAt?.toDate() || new Date(0);
      return dateB - dateA;
    });
    
    return { trips: sortedTrips, error: null };
  } catch (error) {
    console.error("Error fetching trip history:", error);
    return { trips: [], error: error.message };
  }
};

// Fetch user's parking history
export const getUserParkingHistory = async (userId) => {
  try {
    const parkingCollection = collection(db, "users", userId, "parking");
    const parkingSnapshot = await getDocs(parkingCollection);
    const parking = [];
    
    parkingSnapshot.forEach((doc) => {
      parking.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    // Sort by timestamp desc
    const sortedParking = parking.sort((a, b) => {
      const dateA = a.recordedAt?.toDate() || new Date(0);
      const dateB = b.recordedAt?.toDate() || new Date(0);
      return dateB - dateA;
    });
    
    return { parking: sortedParking, error: null };
  } catch (error) {
    console.error("Error fetching parking history:", error);
    return { parking: [], error: error.message };
  }
}; 