
import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || "";
  });

  const [loading, setLoading] = useState(true);

  // Check saved authentication data when app starts
  useEffect(() => {
    if (!token || !user) {
      setUser(null);
      setToken("");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    setLoading(false);
  }, []);

  // Login function
  const login = (userData, jwtToken) => {
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    setToken(jwtToken);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setToken("");
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access authentication
export const useAuth = () => {
  return useContext(AuthContext);
};
