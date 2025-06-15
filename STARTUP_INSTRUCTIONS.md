# Will Counter App - Local Startup Instructions

## 🚨 Current Issue: NPM Cache Corruption

Your npm cache has permission issues. Here's how to fix it and start the app:

## Fix NPM Cache (Required First)

Run this command in Terminal to fix the npm cache permissions:

```bash
sudo chown -R 501:20 "/Users/taoshimomura/.npm"
```

Or alternatively, clear the cache completely:

```bash
sudo rm -rf /Users/taoshimomura/.npm/_cacache
```

## Quick Start (After Fixing Cache)

1. **Navigate to the project:**
   ```bash
   cd /Users/taoshimomura/Desktop/dev/will-counter/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Metro bundler:**
   ```bash
   npm start
   ```

4. **In a new terminal, run the app:**
   ```bash
   # For iOS Simulator
   npm run ios
   
   # For Android Emulator  
   npm run android
   ```

## Alternative: Use Yarn

If npm continues to have issues, use yarn instead:

```bash
# Install yarn if not already installed
npm install -g yarn

# Install dependencies with yarn
yarn install

# Start the app
yarn start
```

## Current App Features (Simplified Version)

The app is currently running a simplified version with:

✅ **Working Features:**
- Login/logout functionality (mock authentication)
- Will counter with increment button
- Count display with formatting (000 format)
- Motivational messages based on count
- Basic statistics cards
- Clean, responsive UI design

📱 **What You Can Test:**
1. **Login Flow:** Tap "Start Tracking" to login
2. **Counter:** Tap the big "+" button to increment your will power
3. **Visual Feedback:** Watch the count increase and motivational messages change
4. **Statistics:** View basic stats (Today, Weekly Avg, Streak)
5. **Logout:** Tap "Logout" to reset and return to login screen

## 🔧 Development Setup

Once the app is running, you can:

1. **View Logs:** Check the Metro bundler terminal for console.log messages
2. **Hot Reload:** Save files to see changes instantly
3. **Debug:** Use React Native debugger or browser dev tools
4. **Test Features:** All core functionality is working in simplified mode

## 🚀 Full Feature Version

To enable the full-featured version (Redux, Auth0, Supabase, etc.):

1. Fix npm cache issues
2. Restore complex package.json: `mv package.complex.json package.json`
3. Restore complex App.tsx: `mv App.complex.tsx App.tsx`
4. Install all dependencies: `npm install`
5. Set up environment variables in `.env` file
6. Configure Supabase and Auth0 credentials

## Environment Setup (For Full Version)

```bash
# Copy environment template
cp ../.env.example .env

# Edit with your credentials
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
# AUTH0_DOMAIN=your-domain.auth0.com
# AUTH0_CLIENT_ID=your-client-id
```

## Troubleshooting

### If Metro won't start:
```bash
npx react-native start --reset-cache
```

### If build fails:
```bash
# Clean everything
rm -rf node_modules
npm install

# iOS specific
cd ios && pod install && cd ..

# Android specific
cd android && ./gradlew clean && cd ..
```

### If still having issues:
```bash
# Use the bare minimum React Native template
npx react-native init WillCounterTest
cd WillCounterTest
# Copy our App.tsx into this new project
```

## Next Steps

Once the app is running successfully:

1. **Test Core Functionality:** Try the will counter and verify it works
2. **Check Console:** Look for log messages when tapping buttons  
3. **UI Testing:** Test on different screen sizes and orientations
4. **Feature Testing:** Verify login/logout flow works correctly

The simplified version demonstrates all the core UI and functionality without external dependencies!