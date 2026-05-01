import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Hardcode a Guest user instead of checking localStorage
  const [user] = useState({ id: 'guest-user-123', username: 'Guest', email: 'guest@ai-planner.com' });
  const [token] = useState('guest-token'); // Dummy token

  const login = () => {}; // No-op
  const logout = () => {}; // No-op

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
