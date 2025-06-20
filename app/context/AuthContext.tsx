// context/AuthContext.tsx
import React, { createContext, useContext, useState } from "react";

type AuthContextType = {
  userName: string;
  setUserName: (name: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userName, setUserName] = useState("");
  const logout = () => {
    setUserName("");
  };

  return (
    <AuthContext.Provider value={{ userName, setUserName,logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
