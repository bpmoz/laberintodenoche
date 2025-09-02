// frontend/src/context/ThemeProvider.jsx

import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    // This is the key fix.
    // If the theme is 'dark', add the 'dark-mode' class.
    // If the theme is 'light', set the class to an empty string, effectively removing it.
    document.body.className = theme === "dark" ? "dark-mode" : "";
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
