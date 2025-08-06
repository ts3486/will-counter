# Claude Prompt: Fix Auth0 NativeModule Error and Test Login

## Error Context
The user is getting this error when trying to login with Auth0:
```
ERROR Login failed: [Error: Missing NativeModule. React Native versions 0.60 and up perform auto-linking. Please see https://github.com/react-native-community/cli/blob/master/docs/autolinking.md.]
```

## Problem Analysis
This error occurs because:
1. **Native modules not properly linked** in React Native/Expo
2. **Auth0 React Native SDK** requires native dependencies
3. **Expo managed workflow** may need additional configuration
4. **Missing native dependencies** for Auth0 authentication

## Required Fixes

### 1. Check Expo Configuration
**File**: `frontend/app.config.js` or `frontend/app.json`

**Add Auth0 configuration:**
```javascript
export default {
  expo: {
    // ... existing config
    plugins: [
      // ... other plugins
      [
        "@auth0/react-native-auth0",
        {
          domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN,
          clientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID,
        }
      ]
    ],
    ios: {
      // ... existing ios config
      bundleIdentifier: "com.yourcompany.willcounter"
    },
    android: {
      // ... existing android config
      package: "com.yourcompany.willcounter"
    }
  }
};
```

### 2. Install Correct Dependencies
**Run these commands:**
```bash
cd frontend
npm uninstall @auth0/react-native-auth0 react-native-keychain
npm install @auth0/react-native-auth0@^2.0.0 react-native-keychain@^8.1.2
npx expo install expo-crypto expo-web-browser
```

### 3. Alternative: Use Expo Auth0 SDK
**If native modules continue to fail, switch to Expo-compatible Auth0:**

```bash
npm uninstall @auth0/react-native-auth0
npm install expo-auth0
```

**Update Auth0 configuration:**
```typescript
// frontend/src/config/auth0.ts
import { Auth0Provider } from 'expo-auth0';

const auth0 = new Auth0Provider({
  domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN!,
  clientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID!,
  audience: process.env.EXPO_PUBLIC_AUTH0_AUDIENCE,
});

export default auth0;
```

### 4. Update AuthContext for Expo Auth0
**File**: `frontend/src/contexts/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Auth0 from 'expo-auth0';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '../store/slices/userSlice';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUserState] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check if user is already authenticated
      const credentials = await Auth0.getCredentials();
      if (credentials) {
        setIsAuthenticated(true);
        setUserState(credentials.user);
        setAccessToken(credentials.accessToken);
        dispatch(setUser(credentials.user));
      }
    } catch (error) {
      console.log('No valid credentials found');
    }
  };

  const login = async () => {
    try {
      const result = await Auth0.authorize({
        scope: 'openid profile email',
        audience: process.env.EXPO_PUBLIC_AUTH0_AUDIENCE,
      });

      if (result.type === 'success') {
        const credentials = await Auth0.getCredentials();
        setIsAuthenticated(true);
        setUserState(credentials.user);
        setAccessToken(credentials.accessToken);
        dispatch(setUser(credentials.user));
        
        // Create or get user in your API
        await createOrGetUser(credentials.user, credentials.accessToken);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await Auth0.clearSession();
      setIsAuthenticated(false);
      setUserState(null);
      setAccessToken(null);
      dispatch(clearUser());
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    return accessToken;
  };

  const createOrGetUser = async (auth0User: any, token: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          auth0_id: auth0User.sub,
          email: auth0User.email,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create/get user');
      }
    } catch (error) {
      console.error('User creation failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, getAccessToken }}>
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
```

### 5. Update API Service
**File**: `frontend/src/services/api.ts`

```typescript
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

export const useApiService = () => {
  const { getAccessToken } = useAuth();

  const getAuthHeaders = async () => {
    try {
      const token = await getAccessToken();
      return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
    } catch (error) {
      return {
        'Content-Type': 'application/json',
      };
    }
  };

  return {
    async getTodayCount() {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/will-counts/today`, {
        headers,
      });
      if (!response.ok) throw new Error('Failed to fetch today count');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },

    async incrementCount() {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/will-counts/increment`, {
        method: 'POST',
        headers,
      });
      if (!response.ok) throw new Error('Failed to increment count');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },

    async createUser(auth0Id: string, email: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ auth0_id: auth0Id, email }),
      });
      if (!response.ok) throw new Error('Failed to create user');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  };
};
```

### 6. Update Login Screen
**File**: `frontend/src/components/auth/LoginScreen.tsx`

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Login Failed', 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Will Counter</Text>
      <Text style={styles.subtitle}>Track your daily willpower</Text>
      <TouchableOpacity 
        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.loginButtonText}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LoginScreen;
```

### 7. Clear Cache and Rebuild
**Run these commands:**
```bash
cd frontend
npx expo start --clear
# Or if using development build:
npx expo run:ios --clear
npx expo run:android --clear
```

### 8. Test the Login Flow
**Steps to test:**
1. Start the API: `cd api && ./gradlew run`
2. Start the frontend: `cd frontend && npx expo start`
3. Open the app and tap "Login"
4. Complete Auth0 authentication
5. Verify you're redirected to the main app
6. Test incrementing the counter
7. Check Supabase dashboard for new data

## Expected Outcome
After fixing:
- ✅ No more NativeModule errors
- ✅ Auth0 login works through the UI
- ✅ JWT tokens are properly obtained and stored
- ✅ API calls include authentication headers
- ✅ User data is created in Supabase
- ✅ RLS policies protect user data

## Troubleshooting
If issues persist:
1. **Check Expo SDK version** - ensure compatibility
2. **Verify Auth0 configuration** - domain, client ID, audience
3. **Check network connectivity** - Auth0 requires internet
4. **Review Auth0 application settings** - callback URLs, allowed origins
5. **Test with Expo Go** vs development build

Please implement these fixes step by step and test the login process after each change. 