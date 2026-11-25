import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/auth/me")
      .then((result) => {
        if (active) {
          setUser(result.user);
          setAuthError("");
        }
      })
      .catch((error) => {
        console.error("Unable to restore the server session.", error);
        if (active) setAuthError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials) => {
    const result = await apiRequest("/api/auth/login", {
      method: "POST",
      body: credentials
    });
    setUser(result.user);
    setAuthError("");
    return result.user;
  };

  const updateProfile = async (updates) => {
    const result = await apiRequest("/api/auth/profile", {
      method: "PATCH",
      body: updates
    });
    setUser(result.user);
    return true;
  };

  const logout = async () => {
    setUser(null);
    setAuthError("");
    await apiRequest("/api/auth/logout", { method: "POST" });
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      updateProfile,
      loading,
      authError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}