# 🚀 Will Counter with Expo - Super Simple Setup

Expo is perfect for quickly testing our Will Counter app! Here's how to get it running in minutes:

## Step 1: Create Expo App

```bash
# Navigate to your dev folder
cd /Users/taoshimomura/Desktop/dev

# Create new Expo app
npx create-expo-app WillCounterExpo --template

# Navigate to the project
cd WillCounterExpo
```

## Step 2: Replace App.js with Our Will Counter

Replace the default `App.js` with our Will Counter code:

```javascript
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    Alert.alert('Success', 'Logged in successfully!');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCount(0);
    Alert.alert('Logged out', 'See you next time!');
  };

  const handleIncrement = () => {
    setCount(prev => prev + 1);
    console.log('🎯 Will power increased!');
  };

  const formatCount = (num) => {
    return num.toString().padStart(3, '0');
  };

  const getMotivationMessage = (count) => {
    if (count === 0) return "Start building your willpower!";
    if (count < 5) return "Great start! Keep going!";
    if (count < 10) return "You're building momentum!";
    return "Amazing willpower! You're unstoppable!";
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Will Counter</Text>
            <Text style={styles.subtitle}>
              Strengthen your willpower, one count at a time
            </Text>
          </View>

          <View style={styles.features}>
            <Text style={styles.featureText}>✓ Track your willpower exercises</Text>
            <Text style={styles.featureText}>✓ View daily statistics</Text>
            <Text style={styles.featureText}>✓ Simple and focused design</Text>
            <Text style={styles.featureText}>✓ Works everywhere with Expo</Text>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Start Tracking</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, Test User</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentInsetAdjustmentBehavior="automatic">
        <View style={styles.countSection}>
          <Text style={styles.label}>Today's Will Power</Text>
          <View style={styles.countContainer}>
            <Text style={styles.count}>{formatCount(count)}</Text>
          </View>
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={handleIncrement}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
          
          <Text style={styles.instruction}>
            Tap the button each time you resist a temptation
          </Text>
        </View>

        <View style={styles.motivationSection}>
          <Text style={styles.motivationText}>
            {getMotivationMessage(count)}
          </Text>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{count}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Math.floor(count / 7)}</Text>
              <Text style={styles.statLabel}>Weekly Avg</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{count > 0 ? 1 : 0}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 24,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#6C5CE7',
    fontWeight: '500',
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
  loginButton: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    alignSelf: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  countSection: {
    alignItems: 'center',
    marginBottom: 64,
    marginTop: 32,
  },
  label: {
    fontSize: 20,
    color: '#636E72',
    marginBottom: 16,
    fontWeight: '500',
  },
  countContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  count: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#6C5CE7',
    textAlign: 'center',
  },
  buttonSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  counterButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  buttonText: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  instruction: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  motivationSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  motivationText: {
    fontSize: 18,
    color: '#2D3436',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 26,
  },
  statsSection: {
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 80,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C5CE7',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '500',
  },
});
```

## Step 3: Start the App

```bash
# Start Expo development server
npx expo start
```

## Step 4: View the App

Expo will give you multiple options:

### Option A: Scan QR Code (Easiest)
1. **Download Expo Go app** on your phone (iOS/Android)
2. **Scan the QR code** that appears in the terminal
3. **App loads instantly** on your phone!

### Option B: Simulators
- Press `i` for iOS Simulator (Mac only)
- Press `a` for Android Emulator
- Press `w` for web browser

## Why Expo is Perfect for Testing

✅ **No Xcode/Android Studio needed**
✅ **Instant updates** - save file, see changes immediately
✅ **Works on your real phone** via QR code
✅ **Web preview** available
✅ **No complex setup** or dependency issues

## What You'll Test

🎯 **Complete Will Counter Experience:**
- Login screen with "Start Tracking" button
- Main counter with big purple "+" button
- Real-time count updates (000, 001, 002...)
- Motivational messages that change with progress
- Statistics cards (Today, Weekly Avg, Streak)
- Logout/login flow

## Bonus: Expo Features

Once running, you can:
- **Shake your phone** to open developer menu
- **Enable live reload** for instant updates
- **Test on multiple devices** simultaneously
- **Share with others** via QR code

This is definitely the fastest way to get the Will Counter app running and test all the features!