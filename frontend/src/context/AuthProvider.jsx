import React, { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(
    localStorage.getItem("token") || null
  );

  useEffect(() => {
    if (authUser) {
      localStorage.setItem("token", authUser);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [authUser]);

  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
