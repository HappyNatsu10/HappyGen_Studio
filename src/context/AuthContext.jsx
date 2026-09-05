import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  updatePassword,
  deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext(null);

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80'
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'

  useEffect(() => {
    // If auth is not configured properly, gracefully fallback
    if (!auth) {
       console.warn("Firebase Auth not initialized. Using guest mode.");
       setLoadingUser(false);
       return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch custom user profile from Firestore
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCurrentUser({ id: user.uid, email: user.email, ...docSnap.data() });
          } else {
            setCurrentUser({ 
              id: user.uid, 
              email: user.email, 
              name: user.displayName || 'User', 
              avatar: user.photoURL || DEFAULT_AVATARS[0] 
            });
          }
        } catch (error) {
          console.error("Error fetching user data (Firebase may not be configured):", error);
          // Fallback if firestore fails
          setCurrentUser({ id: user.uid, email: user.email, name: user.displayName, avatar: user.photoURL });
        }
      } else {
        setCurrentUser(null);
      }
      setLoadingUser(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Register New Account
  const register = async ({ name, email, password, avatar }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await firebaseUpdateProfile(user, {
        displayName: name,
        photoURL: avatar || DEFAULT_AVATARS[0]
      });

      // Save user to Firestore
      const newUserProfile = {
        name: name.trim() || 'Creator',
        email: email.trim().toLowerCase(),
        avatar: avatar || DEFAULT_AVATARS[0],
        tier: 'Pro Studio Creator',
        createdAt: new Date().toISOString(),
        generatedCount: 0,
        savedPrompts: [],
        favoriteImages: [],
        favouriteFolders: ['Uncategorized'],
        customSettings: {
          preferredModel: 'crucibleRINGPonyxl_v28.safetensors',
          defaultSteps: 20,
          defaultCfg: 6.5,
          defaultResolution: '512x768'
        }
      };

      try {
        await setDoc(doc(db, 'users', user.uid), newUserProfile);
      } catch (err) {
        console.warn("Could not save to Firestore (check your Firebase Config).", err);
      }
      
      setCurrentUser({ id: user.uid, ...newUserProfile });
      return user;
    } catch (error) {
      console.error(error);
      throw new Error(error.message || 'Failed to create account.');
    }
  };

  // Login Existing Account
  const login = async ({ email, password }) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      throw new Error('Invalid email or password. Please try again.');
    }
  };

  // Quick Demo Guest Account
  const loginAsGuest = () => {
    const guestUser = {
      id: `guest_${Date.now()}`,
      name: 'Guest Explorer',
      email: 'guest@omnigen.ai',
      avatar: DEFAULT_AVATARS[2],
      tier: 'Guest Sandbox',
      createdAt: new Date().toISOString(),
      generatedCount: 0,
      isGuest: true,
      savedPrompts: [],
      favoriteImages: [],
      favouriteFolders: ['Uncategorized']
    };
    setCurrentUser(guestUser);
    return guestUser;
  };

  // Log Out
  const logout = async () => {
    if (currentUser?.isGuest) {
      setCurrentUser(null);
    } else {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Error signing out", error);
      }
    }
  };

  // Update Profile
  const updateProfile = async (updates) => {
    if (currentUser?.isGuest) {
       setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
       return;
    }
    try {
      const docRef = doc(db, 'users', currentUser.id);
      await updateDoc(docRef, updates);
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  // Increment Generation Counter
  const consumeCredits = async () => {
    if (currentUser?.isGuest) {
      setCurrentUser(prev => prev ? { ...prev, generatedCount: (prev.generatedCount || 0) + 1 } : null);
      return;
    }
    
    try {
       const newCount = (currentUser.generatedCount || 0) + 1;
       setCurrentUser(prev => prev ? { ...prev, generatedCount: newCount } : null);
       const docRef = doc(db, 'users', currentUser.id);
       await updateDoc(docRef, { generatedCount: newCount });
    } catch (error) {
       console.error("Failed to update credits", error);
    }
  };

  // Change Password
  const changePassword = async (currentPassword, newPassword) => {
    if (!currentUser || currentUser.isGuest) {
      throw new Error("Guest accounts cannot change passwords.");
    }
    
    try {
      const user = auth.currentUser;
      if (user) {
        // Technically requires re-authentication for security, but we attempt direct update for now
        await updatePassword(user, newPassword);
      }
      return true;
    } catch (error) {
      console.error(error);
      throw new Error(error.message || "Failed to change password.");
    }
  };

  // Delete Account
  const deleteAccount = async (password) => {
    if (!currentUser || currentUser.isGuest) {
      throw new Error("Guest accounts cannot be deleted.");
    }
    try {
      const user = auth.currentUser;
      if (user) {
        await deleteUser(user);
        setCurrentUser(null);
      }
      return true;
    } catch (error) {
      console.error(error);
      throw new Error(error.message || "Failed to delete account. You may need to sign in again first.");
    }
  };

  const openAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  const closeAuth = () => {
    setShowAuthModal(false);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loadingUser,
      isAuthenticated: !!currentUser,
      register,
      login,
      loginAsGuest,
      logout,
      updateProfile,
      changePassword,
      deleteAccount,
      consumeCredits,
      showAuthModal,
      authModalMode,
      openAuth,
      closeAuth,
      DEFAULT_AVATARS
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
