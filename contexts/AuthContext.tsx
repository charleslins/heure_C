console.log("AuthContext montado");
import React, { createContext, useContext } from 'react';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth'; // Assuming useAuth is in hooks folder

interface AuthContextType {
  currentUser: User | null;
  isLoadingAuth: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Exportar como default para compatibilidade com HMR
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuthContext };
