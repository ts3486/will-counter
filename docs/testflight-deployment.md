# TestFlight Deployment Guide

This guide outlines the steps to deploy the Will Counter React Native app to TestFlight using Expo Application Services (EAS).

## Prerequisites

- ✅ Apple Developer Program membership
- ✅ Expo app configured with bundle ID: `com.willcounter.app`
- Node.js and npm installed
- Access to App Store Connect

## Step 1: Install EAS CLI

```bash
# Install EAS CLI globally
npm install -g @expo/eas-cli

# Login to your Expo account
eas login
```

## Step 2: Initialize EAS Project

```bash
# Navigate to frontend directory
cd frontend

# Configure EAS build
eas build:configure
```

This will create an `eas.json` file with build configurations.

## Step 3: Configure App Store Connect

1. **Create App in App Store Connect**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Click "+" to create a new app
   - Use bundle ID: `com.willcounter.app`
   - App name: "Will Counter"

2. **Set Up App Information**
   - Add app description and keywords
   - Upload app icon (1024x1024px)
   - Set privacy policy URL if required
   - Configure age rating

3. **TestFlight Configuration**
   - Go to TestFlight tab
   - Set up internal testing group
   - Configure beta app information

## Step 4: Update Project Configuration

1. **Update EAS Project ID** in `app.config.js`:
   ```javascript
   extra: {
     eas: {
       projectId: "your-actual-project-id"  // Replace with real project ID
     }
   }
   ```

2. **Configure EAS Build Profiles** in `eas.json`:
   ```json
   {
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal",
         "ios": {
           "bundleIdentifier": "com.willcounter.app.dev"
         }
       },
       "preview": {
         "distribution": "internal",
         "ios": {
           "bundleIdentifier": "com.willcounter.app.preview"
         }
       },
       "production": {
         "ios": {
           "bundleIdentifier": "com.willcounter.app",
           "buildType": "release",
           "distribution": "store"
         }
       }
     },
     "submit": {
       "production": {
         "ios": {
           "appleId": "your-apple-id@example.com",
           "ascAppId": "your-app-store-connect-app-id",
           "appleTeamId": "your-team-id"
         }
       }
     }
   }
   ```

## Step 5: Build for iOS Production

```bash
# Build for iOS App Store
eas build --platform ios --profile production
```

This process will:
- Handle code signing automatically
- Create a production-ready IPA file
- Upload to EAS servers

## Step 6: Submit to TestFlight

### Option A: Automatic Submission
```bash
eas submit --platform ios --profile production
```

### Option B: Manual Upload
1. Download the IPA file from EAS build dashboard
2. Use Xcode or Transporter app to upload to App Store Connect
3. Process will appear in TestFlight within 5-10 minutes

## Step 7: Configure TestFlight Testing

1. **Internal Testing**
   - Add internal testers in App Store Connect
   - Internal testers can install immediately after processing

2. **External Testing** (Optional)
   - Submit for Beta App Review
   - Add external testers after approval
   - Up to 10,000 external testers allowed

## Troubleshooting

### Common Issues

1. **Bundle ID Conflicts**
   - Ensure bundle ID matches in app.config.js and App Store Connect
   - Bundle ID must be unique across App Store

2. **Signing Certificate Issues**
   - EAS handles signing automatically
   - Ensure Apple Developer account has proper permissions

3. **Build Failures**
   - Check EAS build logs for specific errors
   - Verify all dependencies are compatible with production builds

4. **App Store Connect Issues**
   - Ensure app information is complete
   - Check that all required metadata is filled

### Build Commands Reference

```bash
# Check build status
eas build:list

# View build logs
eas build:view [build-id]

# Cancel a build
eas build:cancel [build-id]

# Submit specific build
eas submit --id [build-id]
```

## Post-Deployment

1. **Test Installation**
   - Install via TestFlight on test devices
   - Verify all features work as expected

2. **Gather Feedback**
   - Share TestFlight link with testers
   - Monitor crash reports and feedback

3. **Iterate**
   - Fix issues based on feedback
   - Create new builds as needed
   - Submit to App Store when ready

## Next Steps

After successful TestFlight deployment:
1. Gather user feedback
2. Fix any reported issues
3. Prepare for App Store submission
4. Set up automated CI/CD pipeline for future releases

---

**Note**: Keep your Apple Developer certificates and EAS credentials secure. Never commit sensitive information to version control.