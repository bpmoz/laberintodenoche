import React, { createContext, useState, useEffect } from "react";
import api from "../utils/Api";

export const CurrentUserContext = createContext();

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Check token on mount
    const token = localStorage.getItem("jwt-token");
    console.log("Initial token check:", token);

    if (token) {
      setIsLoading(true);
      api
        .getUserInfo()
        .then((user) => {
          console.log("User info retrieved:", user);
          setCurrentUser(user);
          setIsLoggedIn(true);
        })
        .catch((error) => {
          console.error("Token verification failed:", error);
          // If token verification fails, clear it
          localStorage.removeItem("jwt-token");
          setIsLoggedIn(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (userData) => {
    return api.login(userData).then((res) => {
      if (res && res.token) {
        localStorage.setItem("jwt-token", res.token);
        console.log("Token saved:", res.token);
        // Verify token was saved
        const savedToken = localStorage.getItem("jwt-token");
        console.log("Token verification:", savedToken);

        setCurrentUser(res.user);
        setIsLoggedIn(true);
        return res.user;
      } else {
        throw new Error("No token in response");
      }
    });
  };

  const logout = () => {
    localStorage.removeItem("jwt-token");
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  const value = {
    currentUser,
    isLoggedIn,
    isLoading,
    login,
    logout,
    setCurrentUser,
  };

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
};
