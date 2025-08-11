import React, { createContext, useContext, useState } from 'react';
import { apiService } from '../services/api';

interface UserContextType {
  userId: string | null;
  login: (auth0Id: string, email: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);

  const login = async (auth0Id: string, email: string) => {
    try {
      const user = await apiService.createUser(auth0Id, email);
      setUserId(user.id);
    } catch (error) {
      // Handle existing user case
    }
  };

  return (
    <UserContext.Provider value={{ userId, login }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};