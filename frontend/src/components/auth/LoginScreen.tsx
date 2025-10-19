import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import GradientBackground from '../shared/GradientBackground';
import ThemedButton from '../shared/ThemedButton';

const appSplash = require('../../../assets/splash.png');

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login();
    } catch (err: any) {
      Alert.alert('Login Error', err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Will Counter</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Strengthen your willpower daily
            </Text>
          </View>

          <Image source={appSplash} style={styles.logo} />

          <View style={styles.buttonWrapper}>
            <ThemedButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
              size="large"
              disabled={loading}
              style={[
                styles.loginButton,
                {
                  backgroundColor: theme.colors.primary,
                  shadowColor: 'rgba(27, 94, 32, 0.35)',
                },
              ]}
              textStyle={styles.loginButtonText}
            />
          </View>

          <Text style={[styles.footer, { color: theme.colors.text.secondary }]}>
            Track. Improve. Celebrate.
          </Text>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 20,
  },
  loginButton: {
    width: '100%',
    borderRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
});

export default LoginScreen;
