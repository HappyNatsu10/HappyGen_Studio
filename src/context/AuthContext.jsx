import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('omnigen_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [allUsers, setAllUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('omnigen_accounts_db');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('omnigen_current_user', JSON.stringify(currentUser));
      // Update this user in allUsers DB
      setAllUsers(prev => {
        const index = prev.findIndex(u => u.id === currentUser.id);
        const updated = index >= 0 
          ? [...prev.slice(0, index), currentUser, ...prev.slice(index + 1)]
          : [...prev, currentUser];
        localStorage.setItem('omnigen_accounts_db', JSON.stringify(updated));
        return updated;
      });
    } else {
      localStorage.removeItem('omnigen_current_user');
    }
  }, [currentUser]);

  // Register New Account
  const register = ({ name, email, password, avatar }) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = allUsers.find(u => u.email === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: name.trim() || 'Creator',
      email: cleanEmail,
      password: password, // Stored in local app storage
      avatar: avatar || DEFAULT_AVATARS[0],
      credits: 200,
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

    setCurrentUser(newUser);
    setShowAuthModal(false);
    return newUser;
  };

  // Login Existing Account
  const login = ({ email, password }) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = allUsers.find(u => u.email === cleanEmail && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password. Please try again or create a new account.');
    }

    setCurrentUser(user);
    setShowAuthModal(false);
    return user;
  };

  // Quick Demo Guest Account
  const loginAsGuest = () => {
    const guestUser = {
      id: `guest_${Date.now()}`,
      name: 'Guest Explorer',
      email: 'guest@omnigen.ai',
      avatar: DEFAULT_AVATARS[2],
      credits: 50,
      tier: 'Guest Sandbox',
      createdAt: new Date().toISOString(),
      generatedCount: 0,
      isGuest: true,
      savedPrompts: [],
      favoriteImages: [],
      favouriteFolders: ['Uncategorized']
    };
    setCurrentUser(guestUser);
    setShowAuthModal(false);
    return guestUser;
  };

  // Log Out
  const logout = () => {
    setCurrentUser(null);
  };

  // Update Profile
  const updateProfile = (updates) => {
    setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
  };

  // Deduct Credits / Increment Generation Counter
  const consumeCredits = (amount = 1) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        credits: Math.max(0, (prev.credits || 0) - amount),
        generatedCount: (prev.generatedCount || 0) + 1
      };
    });
  };

  // Add Free Credits
  const addCredits = (amount = 50) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        credits: (prev.credits || 0) + amount
      };
    });
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
      isAuthenticated: !!currentUser,
      register,
      login,
      loginAsGuest,
      logout,
      updateProfile,
      consumeCredits,
      addCredits,
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
