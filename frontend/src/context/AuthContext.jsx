import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("cleantrack_token");

    if (!token) {
      setLoading(false);
      return;
    }

    // AuthContext loads the current user once so every page can know who is logged in.
    authService
      .me()
      .then((response) => {
        if (response.data && response.data.user) {
          setUser(response.data.user);
        } else {
          // Token is invalid, clear it
          localStorage.removeItem("cleantrack_token");
          setUser(null);
        }
      })
      .catch((error) => {
        console.error("Session validation failed:", error.message);
        // Token is invalid or expired, remove it
        localStorage.removeItem("cleantrack_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.data && response.data.token && response.data.user) {
        localStorage.setItem("cleantrack_token", response.data.token);
        setUser(response.data.user);
        return response.data.user;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      // Clear any partial session data on error
      localStorage.removeItem("cleantrack_token");
      setUser(null);
      throw error;
    }
  };

  const register = async (form) => {
    try {
      const response = await authService.register(form);
      if (response.data && response.data.token && response.data.user) {
        localStorage.setItem("cleantrack_token", response.data.token);
        setUser(response.data.user);
        return response.data.user;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      // Clear any partial session data on error
      localStorage.removeItem("cleantrack_token");
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("cleantrack_token");
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
