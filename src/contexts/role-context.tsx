
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState, useMemo } from 'react';

type Role = 'user' | 'admin';

interface RoleContextType {
  role: Role;
  setRole: Dispatch<SetStateAction<Role>>;
  toggleRole: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('user');

  const toggleRole = () => {
    setRole((prevRole) => (prevRole === 'user' ? 'admin' : 'user'));
  };

  const contextValue = useMemo(() => ({ role, setRole, toggleRole }), [role]);

  return (
    <RoleContext.Provider value={contextValue}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
