import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN_USER, REGISTER_USER, RECOVER_PASSWORD, GET_ME } from '../lib/queries';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('auth-token'));

  const { data: meData, refetch: refetchMe } = useQuery(GET_ME, {
    skip: !token,
    onCompleted: (data) => {
      console.log('GET_ME completed:', data);
      if (data.me) {
        setUser(data.me);
      }
      setLoading(false);
    },
    onError: (error) => {
      console.log('GET_ME error:', error);
      logout();
      setLoading(false);
    }
  });

  const [loginMutation] = useMutation(LOGIN_USER);
  const [registerMutation] = useMutation(REGISTER_USER);
  const [recoverPasswordMutation] = useMutation(RECOVER_PASSWORD);

  useEffect(() => {
    if (!token) {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      console.log('Attempting login for:', username);
      const { data } = await loginMutation({
        variables: { username, password }
      });
      
      console.log('Login response:', data);
      
      if (data.login) {
        const { token: newToken, user: userData } = data.login;
        console.log('Setting token and user:', { newToken, userData });
        localStorage.setItem('auth-token', newToken);
        setToken(newToken);
        setUser(userData);
        setLoading(false);
        return { success: true, user: userData };
      }
    } catch (error) {
      console.log('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (username, password) => {
    try {
      const { data } = await registerMutation({
        variables: { username, password }
      });
      
      if (data.register) {
        const { token: newToken, user: userData } = data.register;
        localStorage.setItem('auth-token', newToken);
        setToken(newToken);
        setUser(userData);
        setLoading(false);
        return { success: true, user: userData };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const recoverPassword = async (username, recoveryPhrase, newPassword) => {
    try {
      const { data } = await recoverPasswordMutation({
        variables: { username, recoveryPhrase, newPassword }
      });
      
      if (data.recoverPassword) {
        const { token: newToken, user: userData } = data.recoverPassword;
        localStorage.setItem('auth-token', newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    recoverPassword,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

