import { useEffect, useState } from 'react';

interface UseAdminReturn {
  authenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const useAdmin = (): UseAdminReturn => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  // Simulate a basic login function
  const login = (username: string, password: string): boolean => {
    // Replace with real auth logic as needed
    if (username === 'admin' && password === 'password') {
      setAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthenticated(false);
  };

  // Optionally, load initial state from localStorage or other persistence
  useEffect(() => {
    // Example: const storedAuth = localStorage.getItem('admin-auth');
    // setAuthenticated(storedAuth === 'true');
  }, []);

  return { authenticated, login, logout };
};

export default useAdmin;
