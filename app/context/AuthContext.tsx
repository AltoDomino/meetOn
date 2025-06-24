// context/AuthContext.tsx
import React, { createContext, useContext, useState } from "react";

type AuthContextType = {
  userId: number | null;
  userName: string;
  setUserId: (id: number) => void;
  setUserName: (name: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState("");

  const logout = () => {
    setUserName("");
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ userId, userName, setUserId, setUserName, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
