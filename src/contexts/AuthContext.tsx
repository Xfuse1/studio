"use client";

import { createContext, useState, ReactNode, FC } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'seeker' | 'company';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  signIn: (role: UserRole) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const signIn = (role: UserRole) => {
    // Mock sign-in
    const mockUser: User = {
      id: '1',
      email: role === 'seeker' ? 'seeker@example.com' : 'company@example.com',
      role: role,
    };
    setUser(mockUser);
    router.push('/search');
  };

  const signOut = () => {
    setUser(null);
    router.push('/search');
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
