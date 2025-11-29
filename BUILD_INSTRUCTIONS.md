# Patient Vitals App - Production Build Instructions

## Overview
This document provides step-by-step instructions to build a production APK for the Patient Vitals app that works with both Expo Go and as a standalone APK.

---

## App Information
- **App Name**: Patient Vitals
- **Package Name**: com.yantrammedtech.patientvitals
- **Version**: 1.0.0
- **Features**: 
  - User authentication
  - Patient management
  - Vital signs tracking
  - **Batch export to Excel** (primary feature)

---

## Prerequisites

### 1. Install Required Tools
```bash
# Install Node.js (v18+)
node --version

# Install Expo CLI globally
npm install -g expo-cli eas-cli

# Install Yarn (if not already installed)
npm install -g yarn
```

### 2. Create Expo Account
- Sign up at: https://expo.dev/signup
- Free account is sufficient for building APKs

---

## Method 1: Build Production APK with EAS (Recommended)

### Step 1: Navigate to Project Directory
```bash
cd /app/frontend
```

### Step 2: Login to Expo
```bash
eas login
```
Enter your Expo credentials when prompted.

### Step 3: Configure EAS Project
```bash
# Create/update EAS project
eas build:configure
```

This will prompt you to:
- Create a new project (if first time)
- Link to existing project (if already created)

### Step 4: Build Production APK
```bash
# For production APK
eas build --platform android --profile production
```

**Build Options:**
- The build will take approximately 10-20 minutes
- You'll be asked about credentials - choose "Let EAS handle credentials" for first build
- EAS will automatically generate a keystore for signing

### Step 5: Download APK
Once the build completes:
1. You'll receive a download link in the terminal
2. Or visit: https://expo.dev and navigate to your project
3. Go to "Builds" section
4. Download the APK file

---

## Method 2: Build Preview APK (Faster, for Testing)

For quicker testing builds:

```bash
eas build --platform android --profile preview
```

This creates an APK suitable for:
- Internal testing
- Sharing with testers
- Testing export functionality

---

## Testing the Export Functionality

### Test Batch Export Feature:

1. **Install the APK on Android Device**
   ```bash
   # Using ADB (if device connected)
   adb install path/to/app.apk
   ```

2. **Test Workflow**:
   - Launch the app
   - Sign up / Login
   - Add a patient (Patient ID will auto-generate: PT001, PT002, etc.)
   - Navigate to patient details
   - Add multiple vital readings (use "Add Row" button for batch entry)
   - Click "Save All" to save batch entries
   - Click "Export" button
   - Excel file should be generated and shared

3. **Verify Export**:
   - File format: `.xlsx` (Excel)
   - Filename: `{PatientID}_vitals_{date}.xlsx`
   - Content includes:
     - Patient details (ID, Age, Gender, Weight, Height)
     - All vital readings in tabular format
     - Proper headers and formatting

---

## Using with Expo Go App

### For Development/Testing:

1. **Install Expo Go on Android Device**
   - Download from Google Play Store: "Expo Go"

2. **Start Development Server** (Already running):
   ```bash
   cd /app/frontend
   yarn start
   ```

3. **Scan QR Code**:
   - Open Expo Go app
   - Scan the QR code shown in terminal
   - App will load in Expo Go

4. **Test Features**:
   - All features work in Expo Go including export
   - Export will use device's share functionality
   - Changes reflect immediately during development

---

## Environment Configuration

### Backend URL Configuration:
The app is configured to connect to your backend at:
```
EXPO_PUBLIC_BACKEND_URL=https://export-ready-app.preview.emergentagent.com
```

**For Production**: Update the backend URL in `/app/frontend/.env`:
```env
EXPO_PUBLIC_BACKEND_URL=https://your-production-backend.com
```

Then rebuild the APK.

---

## Build Profiles Explained

### 1. Development Build (`development`)
```bash
eas build --platform android --profile development
```
- Includes dev tools
- Hot reload enabled
- Larger file size
- For active development

### 2. Preview Build (`preview`)
```bash
eas build --platform android --profile preview
```
- Creates APK file
- Suitable for internal testing
- Smaller than development
- Can be shared easily

### 3. Production Build (`production`)
```bash
eas build --platform android --profile production
```
- Optimized for release
- Creates APK for direct distribution
- Or AAB for Google Play Store
- Smallest size, best performance

---

## Troubleshooting

### Issue: Build Fails with Credentials Error
**Solution**: 
```bash
# Clear credentials and rebuild
eas credentials:clear -p android
eas build --platform android --profile production
```

### Issue: Export Not Working in APK
**Verify**:
1. Permissions are set in `app.json`:
   ```json
   "permissions": [
     "android.permission.READ_EXTERNAL_STORAGE",
     "android.permission.WRITE_EXTERNAL_STORAGE"
   ]
   ```
2. Dependencies are installed:
   ```bash
   yarn list expo-file-system expo-sharing
   ```

### Issue: APK Won't Install on Device
**Solution**:
1. Enable "Install from Unknown Sources" on Android device
2. Settings → Security → Unknown Sources (enable)

### Issue: Backend Connection Error
**Check**:
1. Backend URL is accessible from mobile network
2. Backend is running and responding
3. CORS is properly configured (already set in backend)

---

## File Structure

```
/app/frontend/
├── app.json           # App configuration with production settings
├── eas.json           # EAS Build configuration
├── package.json       # Dependencies including export libraries
├── app/               # App screens
│   ├── patient-details.tsx  # Export functionality here
│   └── ...
└── .env               # Environment variables
```

---

## Testing Checklist

Before distributing:

- [ ] APK installs successfully
- [ ] User can sign up and login
- [ ] Can create patients
- [ ] Can add vitals (single and batch)
- [ ] **Export creates Excel file**
- [ ] **Batch export works with multiple vitals**
- [ ] Share dialog appears after export
- [ ] File can be opened in Excel/Sheets
- [ ] App works in both portrait and landscape
- [ ] App handles network errors gracefully

---

## Deployment to Google Play Store

If you want to publish to Play Store:

1. **Build AAB instead of APK**:
   ```bash
   # Modify eas.json production profile:
   "production": {
     "android": {
       "buildType": "app-bundle"
     }
   }
   
   # Build
   eas build --platform android --profile production
   ```

2. **Submit to Play Store**:
   ```bash
   eas submit --platform android
   ```

3. **Follow Google Play Console instructions** for:
   - App listing
   - Screenshots
   - Privacy policy
   - Content rating

---

## Quick Reference Commands

```bash
# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build production APK
eas build --platform android --profile production

# Build preview APK (faster)
eas build --platform android --profile preview

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]

# Install APK on connected device
adb install app.apk

# Start development server for Expo Go
yarn start
```

---

## Support Resources

- **Expo Documentation**: https://docs.expo.dev/
- **EAS Build Guide**: https://docs.expo.dev/build/introduction/
- **Expo Forums**: https://forums.expo.dev/
- **React Native Docs**: https://reactnative.dev/

---

## Summary

✅ **Backend**: Fully tested and working (all APIs functional)
✅ **Export Feature**: Batch export to Excel implemented and tested
✅ **Configuration**: Production-ready app.json and eas.json created
✅ **Permissions**: Storage permissions configured for export
✅ **Build Ready**: Use `eas build` command to generate APK

**Recommended Next Steps**:
1. Run `eas build --platform android --profile production`
2. Test the APK on physical Android device
3. Verify export functionality works end-to-end
4. Distribute to testers or publish to Play Store

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Ready for Production Build ✅
