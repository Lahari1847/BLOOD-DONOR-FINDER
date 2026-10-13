import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'DONOR' | 'PATIENT' | 'HOSPITAL' | 'ADMIN';
  phone?: string | null;
  isVerified: boolean;
  donorProfile?: {
    id: string;
    bloodGroup: string;
    city: string;
    locality?: string | null;
    pincode?: string | null;
    isAvailable: boolean;
    lastConfirmedAt: string;
    lastDonationDate?: string | null;
    totalDonations: number;
    reliabilityScore: number;
    preferredContact?: string;
    isPublic?: boolean;
    consentGiven?: boolean;
    donationRecords?: any[];
  } | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('lifelink_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lifelink_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('lifelink_token', newToken);
    localStorage.setItem('lifelink_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lifelink_token');
    localStorage.removeItem('lifelink_user');
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('lifelink_user', JSON.stringify(updated));
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${apiBaseUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` }, });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('lifelink_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.warn('Failed to refresh user profile:', err);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        updateUser,
        refreshUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
