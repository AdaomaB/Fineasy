import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('fineasy_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('fineasy_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check for demo account
      if (email === 'demo@fineasy.com' && password === 'demo123') {
        const demoUser: User = {
          id: 'demo-user',
          name: 'Demo User',
          email: 'demo@fineasy.com',
          role: 'user'
        };
        setUser(demoUser);
        localStorage.setItem('fineasy_user', JSON.stringify(demoUser));
        return;
      }

      // Check if user exists in localStorage
      const users = JSON.parse(localStorage.getItem('fineasy_users') || '[]');
      const existingUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (!existingUser) {
        throw new Error('Invalid email or password');
      }

      const user: User = {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role || 'user'
      };

      setUser(user);
      localStorage.setItem('fineasy_user', JSON.stringify(user));
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('fineasy_users') || '[]');
      const existingUser = users.find((u: any) => u.email === email);
      
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role: 'user',
        createdAt: new Date().toISOString()
      };

      // Save to users list
      users.push(newUser);
      localStorage.setItem('fineasy_users', JSON.stringify(users));

      // Set current user
      const user: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      };

      setUser(user);
      localStorage.setItem('fineasy_user', JSON.stringify(user));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('fineasy_user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};