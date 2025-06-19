import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { auth0Config, authEndpoints, createAuthRequest } from '../config/auth0';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '../store/slices/userSlice';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUserState] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    createAuthRequest(),
    {
      authorizationEndpoint: authEndpoints.authorizationEndpoint,
      tokenEndpoint: authEndpoints.tokenEndpoint,
      revocationEndpoint: authEndpoints.revocationEndpoint,
    }
  );

  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      handleAuthResponse(response);
    }
  }, [response]);

  const checkAuthState = async () => {
    try {
      setLoading(true);
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const userInfo = await SecureStore.getItemAsync('userInfo');
      
      if (accessToken && userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setIsAuthenticated(true);
        setUserState(parsedUser);
        dispatch(setUser(parsedUser));
      }
    } catch (error) {
      console.log('No valid credentials found');
      setIsAuthenticated(false);
      setUserState(null);
      dispatch(clearUser());
    } finally {
      setLoading(false);
    }
  };

  const handleAuthResponse = async (authResponse: AuthSession.AuthSessionResult) => {
    try {
      setLoading(true);
      
      if (authResponse.type === 'success' && authResponse.params.code) {
        // Exchange code for tokens
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: auth0Config.clientId,
            code: authResponse.params.code,
            redirectUri: auth0Config.redirectUri,
            extraParams: {
              code_verifier: request?.codeVerifier || '',
            },
          },
          {
            tokenEndpoint: authEndpoints.tokenEndpoint,
          }
        );

        if (tokenResponse.accessToken) {
          // Get user info
          const userInfoResponse = await fetch(authEndpoints.userInfoEndpoint, {
            headers: {
              Authorization: `Bearer ${tokenResponse.accessToken}`,
            },
          });
          
          const userInfo = await userInfoResponse.json();
          
          // Store tokens and user info securely
          await SecureStore.setItemAsync('accessToken', tokenResponse.accessToken);
          if (tokenResponse.refreshToken) {
            await SecureStore.setItemAsync('refreshToken', tokenResponse.refreshToken);
          }
          await SecureStore.setItemAsync('userInfo', JSON.stringify(userInfo));
          
          setIsAuthenticated(true);
          setUserState(userInfo);
          dispatch(setUser(userInfo));
          
          // Create or get user in your API
          await createOrGetUser(userInfo);
        }
      }
    } catch (error) {
      console.error('Auth response handling failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      await promptAsync({
        showInRecents: true,
      });
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Clear secure storage
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('userInfo');
      
      // Clear Auth0 session
      const logoutUrl = `${authEndpoints.logoutUrl}?client_id=${auth0Config.clientId}&returnTo=${encodeURIComponent(auth0Config.logoutUrl)}`;
      await WebBrowser.openAuthSessionAsync(logoutUrl, auth0Config.logoutUrl);
      
      setIsAuthenticated(false);
      setUserState(null);
      dispatch(clearUser());
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      return accessToken;
    } catch (error) {
      return null;
    }
  };

  const createOrGetUser = async (auth0User: any) => {
    try {
      const token = await getAccessToken();
      const response = await fetch(`http://localhost:8080/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          auth0_id: auth0User.sub,
          email: auth0User.email,
        }),
      });
      
      if (!response.ok && response.status !== 409) { // 409 = user already exists
        throw new Error('Failed to create/get user');
      }
    } catch (error) {
      console.error('User creation failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      getAccessToken,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};