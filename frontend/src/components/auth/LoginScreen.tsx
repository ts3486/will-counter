import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { login, clearError } from '../../store/slices/authSlice';

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async () => {
    try {
      await dispatch(login());
    } catch (err) {
      Alert.alert('Login Error', 'Failed to login. Please try again.');
    }
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Authentication Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Will Counter</Text>
          <Text style={styles.subtitle}>
            Strengthen your willpower, one count at a time
          </Text>
        </View>

        <View style={styles.features}>
          <Text style={styles.featureText}>✓ Track your willpower exercises</Text>
          <Text style={styles.featureText}>✓ View daily statistics</Text>
          <Text style={styles.featureText}>✓ Secure data with Auth0</Text>
          <Text style={styles.featureText}>✓ Offline support</Text>
        </View>

        <View style={styles.loginSection}>
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login with Auth0</Text>
            )}
          </TouchableOpacity>
          
          <Text style={styles.privacyText}>
            By signing in, you agree to our privacy policy and terms of service.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    marginBottom: 48,
  },
  featureText: {
    fontSize: 16,
    color: '#2D3436',
    marginBottom: 12,
    paddingLeft: 8,
  },
  loginSection: {
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    marginBottom: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  privacyText: {
    fontSize: 12,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 280,
  },
});

export default LoginScreen;