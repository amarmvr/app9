# Quick APK Build Steps - Patient Vitals App

## 🎯 Simple 5-Step Process to Generate APK

---

## Prerequisites

1. **Create Expo Account** (Free):
   - Go to: https://expo.dev/signup
   - Sign up with email
   - Verify your email

2. **Install EAS CLI** (One-time):
   ```bash
   npm install -g eas-cli
   ```

---

## Step 1: Navigate to Project Directory

```bash
cd /app/frontend
```

---

## Step 2: Login to Expo

```bash
eas login
```

Enter the email and password you used to create your Expo account.

**Expected Output**:
```
Logged in as: your-email@example.com
```

---

## Step 3: Initialize EAS Build (First Time Only)

```bash
eas build:configure
```

**What it does**:
- Creates EAS project
- Links your local project to Expo servers
- Confirms build configuration

**You'll be asked**:
- "Would you like to automatically create an EAS project?" → **YES**

**Expected Output**:
```
✔ Created EAS project
✔ Linked local project to EAS
```

---

## Step 4: Build Production APK

```bash
eas build --platform android --profile production
```

**What happens**:
1. EAS uploads your project code to cloud
2. Builds the APK on Expo's servers (takes 10-20 minutes)
3. Provides a download link when complete

**You'll be asked** (first time):
- "Would you like to create a new Android Keystore?" → **YES**
- "Generate a new Android Keystore?" → **YES**

**Progress Updates**:
```
✔ Compressing project files
✔ Uploading to EAS Build
✔ Build in queue... (wait 1-5 minutes)
✔ Building... (wait 10-15 minutes)
✔ Build completed!
```

---

## Step 5: Download Your APK

Once the build completes:

### Option A: Click the Link
```
Build details: https://expo.dev/accounts/[your-account]/builds/[build-id]
```
Click this link and download the APK.

### Option B: Visit Expo Dashboard
1. Go to: https://expo.dev
2. Login
3. Click on your project: "Patient Vitals"
4. Go to "Builds" tab
5. Find your latest build
6. Click "Download" button

---

## 📱 Install APK on Android Device

### Method 1: Direct Download on Device
1. Open the download link on your Android phone's browser
2. Download the APK
3. Allow "Install from Unknown Sources" if prompted
4. Tap the downloaded file to install

### Method 2: Transfer from Computer
1. Download APK on computer
2. Connect Android device via USB
3. Copy APK to device
4. On device, open file manager
5. Tap the APK file to install

### Method 3: Using ADB (Developer Option)
```bash
# If device is connected via USB with debugging enabled
adb install path/to/patient-vitals.apk
```

---

## ✅ Verify Installation

After installation:
1. Find "Patient Vitals" app on your device
2. Open the app
3. Test signup/login
4. Add a patient
5. Add vitals
6. Click "Export" button
7. **Verify Excel file is generated and share dialog appears**

---

## 🔄 Alternative: Test with Expo Go (No Build Needed)

If you want to test immediately without building APK:

1. **Install Expo Go** from Google Play Store
2. **Open Expo Go** app
3. **Scan QR code** or enter URL:
   ```
   https://68b60e33-56c5-4034-a90a-078fa8703a7b.preview.emergentagent.com
   ```
4. App loads instantly - test all features!

**Advantages**:
- No build time
- Instant updates
- Perfect for testing

**When to use APK**:
- For distribution to users
- For app store submission
- For devices without Expo Go

---

## 🚨 Troubleshooting

### Issue: "eas: command not found"
**Solution**:
```bash
npm install -g eas-cli
```

### Issue: Build fails with "credentials error"
**Solution**:
```bash
# Clear and regenerate credentials
eas credentials:clear -p android
eas build --platform android --profile production
```

### Issue: APK won't install on device
**Solution**:
1. Go to Settings → Security
2. Enable "Install from Unknown Sources"
3. Try installing again

### Issue: Export not working in APK
**Verify**:
1. App has storage permissions (Android will ask on first export)
2. Device has sufficient storage space
3. Backend is accessible (check URL in app settings)

---

## 📊 Build Status Check

To check build status anytime:

```bash
# List all builds
eas build:list

# View specific build details
eas build:view [BUILD_ID]
```

---

## 🎨 Build Profiles Explained

We have 3 build profiles configured:

### 1. **Production** (Recommended)
```bash
eas build --platform android --profile production
```
- Optimized for release
- Smallest file size
- Best performance
- Use this for distribution

### 2. **Preview** (Faster Testing)
```bash
eas build --platform android --profile preview
```
- Faster build time
- Good for testing
- Suitable for internal distribution

### 3. **Development** (Debug Build)
```bash
eas build --platform android --profile development
```
- Includes debug tools
- Largest file size
- For active development

---

## 📋 Command Summary

```bash
# One-time setup
npm install -g eas-cli
eas login
eas build:configure

# Build APK
eas build --platform android --profile production

# Check status
eas build:list

# Install on device
adb install app.apk
```

---

## 🎯 What You'll Get

**APK File Details**:
- Name: `patient-vitals-v1.0.0.apk` (or similar)
- Size: ~50-80 MB
- Minimum Android Version: 5.0+
- Features: Full app with export functionality

**APK Works**:
- ✅ Offline (once installed)
- ✅ On any Android device
- ✅ Without Expo Go
- ✅ With export to Excel feature
- ✅ Independent installation

---

## 💡 Pro Tips

1. **First build takes longer** (15-20 min) - subsequent builds are faster (10-15 min)
2. **Keep your Expo account logged in** - you can view all builds anytime
3. **Builds are stored for 30 days** on free plan - download within this time
4. **Test on Expo Go first** - saves time during development
5. **Use production profile** for final distribution

---

## 📞 Need Help?

- **Expo Documentation**: https://docs.expo.dev/
- **Build Guide**: https://docs.expo.dev/build/introduction/
- **Community Forums**: https://forums.expo.dev/

---

## ✨ Summary

**To generate APK, just run these 4 commands**:

```bash
cd /app/frontend
eas login
eas build:configure
eas build --platform android --profile production
```

**Wait 10-20 minutes**, then **download and install** your APK!

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Ready to Build ✅
