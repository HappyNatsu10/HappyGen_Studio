import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  updatePassword,
  deleteUser,
  GoogleAuthProvider,
  TwitterAuthProvider,
  signInWithPopup
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
    // Check localStorage for a guest session before giving up completely
    const savedGuest = localStorage.getItem('happygen_guest_user');
    if (savedGuest && !auth) {
       setCurrentUser(JSON.parse(savedGuest));
       setLoadingUser(false);
       return;
    }

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
            setCurrentUser({ id: user.uid, email: user.email, creationTime: user.metadata?.creationTime, ...docSnap.data() });
          } else {
            setCurrentUser({ 
              id: user.uid, 
              email: user.email, 
              name: user.displayName || 'User', 
              avatar: user.photoURL || DEFAULT_AVATARS[0],
              creationTime: user.metadata?.creationTime
            });
          }
        } catch (error) {
          console.error("Error fetching user data (Firebase may not be configured):", error);
          // Fallback if firestore fails
          setCurrentUser({ id: user.uid, email: user.email, name: user.displayName, avatar: user.photoURL, creationTime: user.metadata?.creationTime });
        }
      } else {
        // If not authenticated via Firebase, check if they were a guest
        const savedGuestUser = localStorage.getItem('happygen_guest_user');
        if (savedGuestUser) {
           setCurrentUser(JSON.parse(savedGuestUser));
        } else {
           setCurrentUser(null);
        }
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

      // Inherit guest state if present
      const guestModels = currentUser?.isGuest && currentUser.favouriteModels ? currentUser.favouriteModels : [];
      const guestFolders = currentUser?.isGuest && currentUser.favouriteFolders ? currentUser.favouriteFolders : ['Uncategorized'];

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
        favouriteFolders: guestFolders,
        favouriteModels: guestModels,
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
      // Inherit guest state if present
      const guestModels = currentUser?.isGuest && currentUser.favouriteModels ? currentUser.favouriteModels : [];
      const guestFolders = currentUser?.isGuest && currentUser.favouriteFolders ? currentUser.favouriteFolders.filter(f => f !== 'Uncategorized') : [];

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      let finalData = {};
      
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
           finalData = docSnap.data();
        } else {
           finalData = {
             name: user.displayName || 'User',
             avatar: user.photoURL || DEFAULT_AVATARS[0],
             favouriteModels: [],
             favouriteFolders: ['Uncategorized']
           };
        }
      } catch (err) {
        console.error("Failed to fetch user data during login:", err);
        finalData = {
           name: user.displayName || 'User',
           avatar: user.photoURL || DEFAULT_AVATARS[0]
        };
      }
      
      // If we had guest favorites, merge them into the account we just logged into
      if (guestModels.length > 0 || guestFolders.length > 0) {
          const existingModels = finalData.favouriteModels || [];
          const existingFolders = finalData.favouriteFolders || ['Uncategorized'];
          
          // Merge, avoiding duplicates by id
          const mergedModels = [...existingModels];
          for (const gm of guestModels) {
            if (!mergedModels.find(m => m.id === gm.id)) {
              mergedModels.push(gm);
            }
          }
          
          const mergedFolders = [...new Set([...existingFolders, ...guestFolders])];
          
          finalData.favouriteModels = mergedModels;
          finalData.favouriteFolders = mergedFolders;
          
          try {
             await setDoc(doc(db, 'users', user.uid), {
               favouriteModels: mergedModels,
               favouriteFolders: mergedFolders
             }, { merge: true });
          } catch (e) {
             console.error("Could not merge guest data on login", e);
          }
      }
      
      // Explicitly set the user IMMEDIATELY so the UI reflects they are logged in!
      setCurrentUser({ id: user.uid, email: user.email, ...finalData });
      
      return user;
    } catch (error) {
      console.error("Login Error:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password. Please try again.');
      }
      throw new Error(error.message || 'An error occurred during sign in.');
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Inherit guest state if present
      const guestModels = currentUser?.isGuest && currentUser.favouriteModels ? currentUser.favouriteModels : [];
      const guestFolders = currentUser?.isGuest && currentUser.favouriteFolders ? currentUser.favouriteFolders.filter(f => f !== 'Uncategorized') : [];

      let finalData = {};
      
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
           finalData = docSnap.data();
        } else {
           // New user from Google
           finalData = {
             name: user.displayName || 'Creator',
             email: user.email,
             avatar: user.photoURL || DEFAULT_AVATARS[0],
             tier: 'Pro Studio Creator',
             createdAt: new Date().toISOString(),
             generatedCount: 0,
             savedPrompts: [],
             favoriteImages: [],
             favouriteFolders: guestFolders.length ? guestFolders : ['Uncategorized'],
             favouriteModels: guestModels,
             customSettings: {
               preferredModel: 'crucibleRINGPonyxl_v28.safetensors',
               defaultSteps: 20,
               defaultCfg: 6.5,
               defaultResolution: '512x768'
             }
           };
        }
      } catch (err) {
        console.error("Failed to fetch user data during Google login:", err);
        finalData = {
           name: user.displayName || 'Creator',
           email: user.email,
           avatar: user.photoURL || DEFAULT_AVATARS[0]
        };
      }
      
      if (guestModels.length > 0 || guestFolders.length > 0) {
          const existingModels = finalData.favouriteModels || [];
          const existingFolders = finalData.favouriteFolders || ['Uncategorized'];
          
          const mergedModels = [...existingModels];
          for (const gm of guestModels) {
            if (!mergedModels.find(m => m.id === gm.id)) {
              mergedModels.push(gm);
            }
          }
          
          const mergedFolders = [...new Set([...existingFolders, ...guestFolders])];
          
          finalData.favouriteModels = mergedModels;
          finalData.favouriteFolders = mergedFolders;
          
          try {
             await setDoc(doc(db, 'users', user.uid), {
               favouriteModels: mergedModels,
               favouriteFolders: mergedFolders
             }, { merge: true });
          } catch (e) {
             console.error("Could not merge guest data on login", e);
          }
      } else {
         try {
            await setDoc(doc(db, 'users', user.uid), finalData, { merge: true });
         } catch (e) {
            console.error("Could not set user doc", e);
         }
      }
      
      setCurrentUser({ id: user.uid, email: user.email, ...finalData });
      return user;
    } catch (error) {
      console.error("Google Login Error:", error);
      throw new Error(error.message || 'An error occurred during Google sign in.');
    }
  };

  // Login with Twitter
  const loginWithTwitter = async () => {
    try {
      const provider = new TwitterAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const guestModels = currentUser?.isGuest && currentUser.favouriteModels ? currentUser.favouriteModels : [];
      const guestFolders = currentUser?.isGuest && currentUser.favouriteFolders ? currentUser.favouriteFolders.filter(f => f !== 'Uncategorized') : [];

      let finalData = {};
      
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
           finalData = docSnap.data();
        } else {
           finalData = {
             name: user.displayName || 'Creator',
             email: user.email,
             avatar: user.photoURL || DEFAULT_AVATARS[0],
             tier: 'Pro Studio Creator',
             createdAt: new Date().toISOString(),
             generatedCount: 0,
             savedPrompts: [],
             favoriteImages: [],
             favouriteFolders: guestFolders.length ? guestFolders : ['Uncategorized'],
             favouriteModels: guestModels,
             customSettings: {
               preferredModel: 'crucibleRINGPonyxl_v28.safetensors',
               defaultSteps: 20,
               defaultCfg: 6.5,
               defaultResolution: '512x768'
             }
           };
        }
      } catch (err) {
        console.error("Failed to fetch user data during Twitter login:", err);
        finalData = {
           name: user.displayName || 'Creator',
           email: user.email,
           avatar: user.photoURL || DEFAULT_AVATARS[0]
        };
      }
      
      if (guestModels.length > 0 || guestFolders.length > 0) {
          const existingModels = finalData.favouriteModels || [];
          const existingFolders = finalData.favouriteFolders || ['Uncategorized'];
          
          const mergedModels = [...existingModels];
          for (const gm of guestModels) {
            if (!mergedModels.find(m => m.id === gm.id)) {
              mergedModels.push(gm);
            }
          }
          
          const mergedFolders = [...new Set([...existingFolders, ...guestFolders])];
          
          finalData.favouriteModels = mergedModels;
          finalData.favouriteFolders = mergedFolders;
          
          try {
             await setDoc(doc(db, 'users', user.uid), {
               favouriteModels: mergedModels,
               favouriteFolders: mergedFolders
             }, { merge: true });
          } catch (e) {
             console.error("Could not merge guest data on login", e);
          }
      } else {
         try {
            await setDoc(doc(db, 'users', user.uid), finalData, { merge: true });
         } catch (e) {
            console.error("Could not set user doc", e);
         }
      }
      
      setCurrentUser({ id: user.uid, email: user.email, ...finalData });
      return user;
    } catch (error) {
      console.error("Twitter Login Error:", error);
      throw new Error(error.message || 'An error occurred during Twitter sign in.');
    }
  };

  // Quick Demo Guest Account
  const loginAsGuest = () => {
    const guestUser = {
      id: `guest_${Date.now()}`,
      name: 'Guest Explorer',
      email: 'guest@happygen.ai',
      avatar: DEFAULT_AVATARS[2],
      tier: 'Guest Sandbox',
      createdAt: new Date().toISOString(),
      generatedCount: 0,
      isGuest: true,
      savedPrompts: [],
      favoriteImages: [],
      favouriteFolders: ['Uncategorized'],
      favouriteModels: []
    };
    setCurrentUser(guestUser);
    localStorage.setItem('happygen_guest_user', JSON.stringify(guestUser));
    return guestUser;
  };

  // Log Out
  const logout = async () => {
    if (currentUser?.isGuest) {
      setCurrentUser(null);
      localStorage.removeItem('happygen_guest_user');
    } else {
      try {
        await signOut(auth);
        localStorage.removeItem('happygen_guest_user');
      } catch (error) {
        console.error("Error signing out", error);
      }
    }
  };

  // Update Profile
  const updateProfile = async (updates) => {
    if (currentUser?.isGuest) {
       const updatedGuest = { ...currentUser, ...updates };
       setCurrentUser(updatedGuest);
       localStorage.setItem('happygen_guest_user', JSON.stringify(updatedGuest));
       return;
    }
    
    // Optimistic UI update
    setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    
    try {
      const docRef = doc(db, 'users', currentUser.id);
      // Use setDoc with merge instead of updateDoc so it creates the doc if missing
      await setDoc(docRef, updates, { merge: true });
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  // Increment Generation Counter
  const incrementGeneratedCount = async () => {
    if (currentUser?.isGuest) {
      const newCount = (currentUser.generatedCount || 0) + 1;
      const updatedGuest = { ...currentUser, generatedCount: newCount };
      setCurrentUser(updatedGuest);
      localStorage.setItem('happygen_guest_user', JSON.stringify(updatedGuest));
      return;
    }
    
    try {
       const newCount = (currentUser.generatedCount || 0) + 1;
       setCurrentUser(prev => prev ? { ...prev, generatedCount: newCount } : null);
       const docRef = doc(db, 'users', currentUser.id);
       await setDoc(docRef, { generatedCount: newCount }, { merge: true });
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
      loginWithGoogle,
      loginWithTwitter,
      loginAsGuest,
      logout,
      updateProfile,
      incrementGeneratedCount,
      changePassword,
      deleteAccount,
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
