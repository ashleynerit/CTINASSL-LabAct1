import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const demoAccount = {
  id: "demo-user",
  name: "User",
  email: "usertest@daffodil.com",
  password: "usertest123",
  role: "user"
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user")) || null
  );

  useEffect(() => {
    const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    const existingIndex = accounts.findIndex(
      (account) =>
        account.email?.toLowerCase() === demoAccount.email.toLowerCase()
    );

    if (existingIndex === -1) {
      accounts.push(demoAccount);
    } else {
      accounts[existingIndex] = { ...accounts[existingIndex], ...demoAccount };
    }

    localStorage.setItem("accounts", JSON.stringify(accounts));
  }, []);

  const login = (account) => {
    localStorage.setItem("user", JSON.stringify(account));
    setUser(account);
  };

  const updateProfile = (updates) => {
    if (!user) return false;

    const updatedUser = { ...user, ...updates };

    try {
      const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
      const accountIndex = accounts.findIndex(
        (account) => account.email === user.email
      );

      if (accountIndex === -1) {
        accounts.push(updatedUser);
      } else {
        accounts[accountIndex] = updatedUser;
      }

      localStorage.setItem("accounts", JSON.stringify(accounts));
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Unable to save profile updates.", error);
      return false;
    }

    setUser(updatedUser);
    return true;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
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