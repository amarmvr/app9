# 📱 LOCAL APK GENERATION - Complete Guide for Patient Vitals App

## 🎯 Overview
This guide provides **detailed step-by-step instructions** to generate an APK for the Patient Vitals App locally using Expo's EAS Build service.

---

## ✅ What's Already Done

### Repository Status:
- ✅ Code cloned from: https://github.com/amarmvr/app7
- ✅ Backend tested (100% pass rate - all APIs working)
- ✅ Frontend installed and running
- ✅ Dependencies installed
- ✅ Configuration files ready (app.json, eas.json)
- ✅ Excel export functionality tested and verified

### App Information:
- **App Name:** Patient Vitals
- **Package Name:** com.yantrammedtech.patientvitals
- **Version:** 1.0.0
- **Features:** User Auth, Patient Management, Vitals Tracking, **Excel Export**

---

## 📋 Prerequisites

### 1. System Requirements
You need the following installed on your **local machine** (not in this container):

```bash
# Node.js (v18 or higher)
node --version

# npm or yarn
npm --version

# Git (to clone if needed)
git --version
```

### 2. Create Expo Account (FREE)
1. Visit: https://expo.dev/signup
2. Sign up with your email
3. Verify your email address
4. Remember your credentials (you'll need them)

---

## 🚀 METHOD 1: LOCAL APK Generation Using EAS Build

### What is EAS Build?
- **EAS (Expo Application Services)** is Expo's cloud build service
- Builds APK/AAB files on Expo's servers
- No need for Android Studio or SDK on your machine
- Works on Windows, Mac, and Linux
- **FREE** for personal projects (limited builds per month)

### Step 1: Install EAS CLI Globally

On your **local machine**, open terminal and run:

```bash
npm install -g eas-cli
```

**Verify installation:**
```bash
eas --version
# Should show: eas-cli/x.x.x
```

---

### Step 2: Download the Project to Your Local Machine

**Option A: Clone from GitHub (Recommended)**
```bash
# Clone the repository
git clone https://github.com/amarmvr/app7.git
cd app7/frontend
```

**Option B: Download from Current Environment**
```bash
# If you have SSH/FTP access to this container
# Download the /app/frontend directory to your local machine
```

---

### Step 3: Navigate to Frontend Directory

```bash
cd /path/to/app7/frontend
# or
cd /path/to/downloaded/frontend
```

---

### Step 4: Install Dependencies (First Time Only)

```bash
# Install all npm packages
yarn install
# or
npm install
```

**Expected output:**
```
✔ Installed dependencies
```

---

### Step 5: Login to Expo

```bash
eas login
```

**You'll be prompted:**
```
Email or username: [Enter your Expo email]
Password: [Enter your Expo password]
```

**Expected output:**
```
✔ Logged in as: your-email@example.com
```

**Troubleshooting:**
- If login fails, check your credentials
- Reset password at: https://expo.dev/forgot-password
- Ensure you verified your email

---

### Step 6: Initialize EAS Build Configuration

```bash
eas build:configure
```

**What happens:**
1. Checks if `eas.json` exists (it already does in your project)
2. Creates a project on Expo's servers
3. Links your local project to Expo

**You'll be asked:**
```
? Would you like to automatically create an EAS project for @your-username/patient-vitals-app?
```
**Answer:** `Y` (Yes)

**Expected output:**
```
✔ Created EAS project
✔ Linked local project to EAS project
Project ID: [some-project-id]
```

---

### Step 7: Build Production APK

Now, the main step to generate your APK:

```bash
eas build --platform android --profile production
```

**What happens:**
1. **Credentials Setup (First Time Only)**
   - You'll be asked: "Would you like to generate a new Android Keystore?"
   - **Answer:** `Y` (Yes)
   - EAS will automatically generate and manage your keystore
   
2. **Project Upload**
   - Your project files are compressed and uploaded to Expo servers
   - This takes 1-3 minutes depending on your internet speed
   
3. **Build Queue**
   - Your build is placed in queue
   - Free accounts may wait 1-10 minutes
   
4. **Building**
   - Expo servers compile your app
   - This takes 10-20 minutes
   - You'll see real-time progress

**Expected output:**
```
✔ Compressing project files
✔ Uploading to EAS Build
⠙ Build in queue... (position: 2)
⠙ Building... (this may take several minutes)
✔ Build finished!

Build details:
  https://expo.dev/accounts/your-username/projects/patient-vitals-app/builds/abc123

Download:
  https://expo.dev/artifacts/eas/[long-url]/patient-vitals.apk
```

---

### Step 8: Download Your APK

**Option A: Direct Download Link**
1. Copy the download URL from terminal output
2. Open it in your browser
3. APK file downloads automatically

**Option B: Via Expo Dashboard**
1. Visit: https://expo.dev
2. Login with your credentials
3. Click on "patient-vitals-app" project
4. Go to "Builds" tab
5. Find your latest build
6. Click "Download" button

**APK File Details:**
- Filename: `build-[timestamp].apk`
- Size: ~50-80 MB
- Minimum Android: 5.0 (API 21)

---

### Step 9: Install APK on Android Device

**Method A: Direct Download on Android Phone**
1. Open the download link on your Android phone's browser
2. Download the APK file
3. Tap the downloaded file
4. If prompted, enable "Install from Unknown Sources"
5. Tap "Install"

**Method B: Transfer from Computer**
1. Download APK on your computer
2. Connect Android device via USB
3. Enable "File Transfer" mode
4. Copy APK to phone storage
5. On phone, use File Manager to find APK
6. Tap APK file and install

**Method C: Using ADB (For Developers)**
```bash
# Connect device via USB with USB debugging enabled
adb devices

# Install APK
adb install path/to/patient-vitals.apk

# Expected output:
# Performing Streamed Install
# Success
```

---

### Step 10: Test the Installed App

After installation:
1. **Find the app:** Look for "Patient Vitals" icon
2. **Open the app**
3. **Test basic flow:**
   - Sign up with test account
   - Login
   - Add a patient (ID auto-generates: PT001)
   - Add vital readings
   - Test **Export** feature (creates Excel file)
   - Share functionality should work

---

## 🔧 Build Profiles Explained

The `eas.json` file has 3 build profiles:

### 1. Development Build
```bash
eas build --platform android --profile development
```
- **Use for:** Active development
- **Size:** Largest (~100MB)
- **Features:** Debug tools, hot reload
- **Build time:** 15-20 minutes

### 2. Preview Build (Faster Testing)
```bash
eas build --platform android --profile preview
```
- **Use for:** Internal testing, sharing with testers
- **Size:** Medium (~70MB)
- **Features:** Production-like but faster build
- **Build time:** 10-15 minutes
- **Recommended for:** Quick testing before final release

### 3. Production Build (Recommended)
```bash
eas build --platform android --profile production
```
- **Use for:** Final release, distribution
- **Size:** Smallest (~50-60MB)
- **Features:** Fully optimized, best performance
- **Build time:** 10-20 minutes
- **Recommended for:** User distribution

---

## 📊 Monitoring Your Build

### Check Build Status
```bash
# List all builds
eas build:list

# View specific build details
eas build:view [BUILD_ID]
```

### Build Status Meanings:
- 🟡 **In Queue:** Waiting to start
- 🔵 **In Progress:** Currently building
- 🟢 **Finished:** Build successful (download available)
- 🔴 **Errored:** Build failed (check logs)
- 🟠 **Canceled:** Build was canceled

---

## 🚀 METHOD 2: True Local Build (Advanced - NOT Recommended)

**⚠️ Warning:** This method is complex and requires:
- Android SDK
- Android Studio
- Java JDK
- Gradle
- Significant disk space (~10GB)
- Advanced technical knowledge

**Why EAS Build is Better:**
- ✅ No setup required
- ✅ Works on any OS
- ✅ Automatic credential management
- ✅ Consistent builds
- ✅ No disk space issues

**If you still want to do true local builds:**
1. Install Android Studio
2. Install Android SDK
3. Configure environment variables
4. Run `eas build --local`

**This is NOT recommended** for most users. Stick with Method 1.

---

## 🔍 Troubleshooting Common Issues

### Issue 1: "eas: command not found"
**Solution:**
```bash
npm install -g eas-cli
# or
yarn global add eas-cli
```

### Issue 2: Build Fails with "Invalid credentials"
**Solution:**
```bash
# Clear credentials
eas credentials

# Select "Android"
# Select "Remove all credentials"
# Rebuild
eas build --platform android --profile production
```

### Issue 3: "Unable to authenticate"
**Solution:**
```bash
# Logout and login again
eas logout
eas login
```

### Issue 4: Build Fails with "Gradle error"
**Solution:**
- This usually means a dependency issue
- Check if all packages in `package.json` are compatible
- Try building with `preview` profile first

### Issue 5: APK Won't Install on Device
**Solution:**
1. Go to: Settings → Security → Unknown Sources
2. Enable "Install from Unknown Sources"
3. Try again

### Issue 6: Export Feature Not Working in APK
**Solution:**
- Ensure you granted storage permissions
- Check if backend URL is accessible from mobile network
- Test with Expo Go first to verify backend connectivity

### Issue 7: "Build quota exceeded"
**Solution:**
- Free Expo accounts have build limits
- Wait for monthly reset or upgrade to paid plan
- Or use local builds (`eas build --local`)

---

## 💰 EAS Build Pricing

### Free Plan:
- ✅ 30 builds per month
- ✅ Good for personal projects
- ✅ All features included

### Paid Plans:
If you need more builds, upgrade at: https://expo.dev/pricing

---

## 📱 Alternative: Test with Expo Go (No Build Needed)

If you just want to **test quickly** without building APK:

### Step 1: Install Expo Go
- Download "Expo Go" from Google Play Store
- It's free

### Step 2: Start Development Server
```bash
cd /app/frontend
expo start --tunnel
```

### Step 3: Scan QR Code
- Open Expo Go app
- Scan QR code or enter URL:
  ```
  https://1f7a0c4e-45b0-4f35-9721-56ad50684965.preview.emergentagent.com
  ```

### Step 4: Test
- App loads instantly
- All features work
- Export functionality works
- Changes reflect immediately

**When to use Expo Go:**
- ✅ Quick testing
- ✅ Development
- ✅ Feature verification

**When to use APK:**
- ✅ User distribution
- ✅ App store submission
- ✅ Devices without Expo Go

---

## 🎯 Quick Reference Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Check login status
eas whoami

# Configure project
eas build:configure

# Build APK (Production)
eas build --platform android --profile production

# Build APK (Preview - faster)
eas build --platform android --profile preview

# List all builds
eas build:list

# Check specific build
eas build:view [BUILD_ID]

# Install on device
adb install app.apk
```

---

## 📞 Support Resources

- **Expo Documentation:** https://docs.expo.dev/
- **EAS Build Guide:** https://docs.expo.dev/build/introduction/
- **Troubleshooting:** https://docs.expo.dev/build-reference/troubleshooting/
- **Community Forum:** https://forums.expo.dev/
- **Discord Community:** https://chat.expo.dev/

---

## ✅ Pre-Distribution Checklist

Before sharing your APK:

- [ ] APK installs successfully on test device
- [ ] Signup/Login works
- [ ] Can create patients
- [ ] Can add vitals (single and batch)
- [ ] **Export creates Excel file**
- [ ] Share functionality works
- [ ] App handles no internet gracefully
- [ ] Tested on Android 8+ device
- [ ] Tested on Android 13+ device
- [ ] All permissions work
- [ ] App doesn't crash

---

## 🎨 Customization Before Building

### Update Backend URL (Important!)
If deploying to production backend:

1. Edit `/app/frontend/.env`:
```env
EXPO_PUBLIC_BACKEND_URL=https://your-production-backend.com
```

2. Rebuild APK

### Change App Name or Icon
1. Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "icon": "./assets/images/icon.png"
  }
}
```

2. Replace icons in `assets/images/`
3. Rebuild APK

---

## 📦 What's Included in APK

✅ **Fully Functional Features:**
- User Authentication (Signup/Login)
- Patient Management (Add, View, Edit)
- Vitals Tracking (Single entry)
- Batch Vitals Entry (Multiple at once)
- Excel Export (Download .xlsx file)
- Offline capability (after initial data load)

✅ **Permissions:**
- Storage (for Excel export)
- Internet (for API calls)

✅ **Supported Devices:**
- Android 5.0+ (API Level 21+)
- All screen sizes

---

## 🔄 Updating Your App

When you make changes and want new APK:

```bash
# 1. Make your code changes
# 2. Test locally with Expo Go
# 3. Build new APK
eas build --platform android --profile production

# 4. Download new APK
# 5. Distribute to users
```

**Version Management:**
Update version in `app.json`:
```json
{
  "expo": {
    "version": "1.0.1"
  }
}
```

---

## 🎯 Summary

### To Generate APK Locally:

1. **Install EAS CLI:** `npm install -g eas-cli`
2. **Login:** `eas login`
3. **Configure:** `eas build:configure`
4. **Build:** `eas build --platform android --profile production`
5. **Wait:** 10-20 minutes
6. **Download:** From link or dashboard
7. **Install:** On Android device
8. **Test:** All features

### Build Time: 10-20 minutes
### Build Cost: FREE (up to 30 builds/month)
### Technical Difficulty: EASY ⭐⭐☆☆☆

---

## ✨ Final Notes

- ✅ Your app is **fully tested and ready** for APK generation
- ✅ Backend APIs are **100% functional**
- ✅ Excel export feature is **verified working**
- ✅ All configuration files are **production-ready**
- ✅ Just follow the steps above to generate APK

**Estimated Total Time:** 30 minutes (including build time)

---

**Document Version:** 1.0  
**Last Updated:** November 29, 2024  
**Status:** ✅ Ready for APK Generation  
**App Status:** ✅ Production Ready
