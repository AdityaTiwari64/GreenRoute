import { createContext, useContext, useState, useEffect } from 'react';
import { auth, getCurrentUser, getUserProfile, createUserProfile } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user's profile including green points
        const { profile, error } = await getUserProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
        } else if (error) {
          console.error("Error fetching user profile:", error);
          // If profile not found but user exists, try to create a default profile
          if (error === "User profile not found") {
            try {
              const { success } = await createUserProfile(user.uid, {
                email: user.email,
                displayName: user.displayName || user.email?.split('@')[0] || 'User',
                photoURL: user.photoURL
              });
              
              if (success) {
                // Fetch the newly created profile
                const { profile: newProfile } = await getUserProfile(user.uid);
                if (newProfile) {
                  setUserProfile(newProfile);
                }
              }
            } catch (createErr) {
              console.error("Error creating default user profile:", createErr);
            }
          }
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    }, (error) => {
      console.error("Auth state change error:", error);
      setError(error.message);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Check if the user is authenticated
  const isAuthenticated = !!currentUser;

  // Get user profile data
  const getAuthUserProfile = () => {
    if (!currentUser) return null;
    
    return {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
      photoURL: currentUser.photoURL,
      greenPoints: userProfile?.greenPoints || 0,
      ...userProfile,
    };
  };

  const value = {
    currentUser,
    userProfile,
    isAuthenticated,
    loading,
    error,
    getUserProfile: getAuthUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 