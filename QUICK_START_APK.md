# 🚀 Quick Start: Generate APK in 5 Minutes

## ⚡ Copy-Paste Commands for APK Generation

### Prerequisites (One-Time Setup):
1. Have Node.js installed on your local machine
2. Create free Expo account at https://expo.dev/signup

---

## 📝 Step-by-Step Commands

### Step 1: Install EAS CLI (One-Time)
```bash
npm install -g eas-cli
```

### Step 2: Clone Repository
```bash
git clone https://github.com/amarmvr/app7.git
cd app7/frontend
```

### Step 3: Install Dependencies
```bash
yarn install
```
*or*
```bash
npm install
```

### Step 4: Login to Expo
```bash
eas login
```
*Enter your Expo email and password*

### Step 5: Configure EAS (First Time Only)
```bash
eas build:configure
```
*Press Y when asked to create EAS project*

### Step 6: Build Production APK
```bash
eas build --platform android --profile production
```

**⏱️ Wait Time:** 10-20 minutes

**✅ Result:** You'll get a download link for your APK!

---

## 📥 After Build Completes

### Download APK:
1. **From Terminal:** Copy the download URL shown
2. **From Dashboard:** Visit https://expo.dev → Your Projects → Builds → Download

### Install on Android:
1. Transfer APK to Android device
2. Enable "Install from Unknown Sources" in Settings
3. Tap APK file to install
4. Done! 🎉

---

## 🧪 Quick Test (Without Building APK)

Want to test immediately without waiting for build?

### Install Expo Go:
1. Download "Expo Go" from Google Play Store

### Test App:
1. Open Expo Go
2. Enter URL: `https://1f7a0c4e-45b0-4f35-9721-56ad50684965.preview.emergentagent.com`
3. Test all features immediately!

---

## 🎯 Build Profiles

### For Testing (Faster):
```bash
eas build --platform android --profile preview
```
⏱️ 10-15 minutes

### For Production (Recommended):
```bash
eas build --platform android --profile production
```
⏱️ 10-20 minutes

---

## 🆘 Common Issues

### Issue: "eas: command not found"
```bash
npm install -g eas-cli
```

### Issue: "Authentication failed"
```bash
eas logout
eas login
```

### Issue: "Build failed"
```bash
eas credentials
# Remove all credentials
# Try building again
```

---

## 📊 Check Build Status

```bash
# List all builds
eas build:list

# View specific build
eas build:view [BUILD_ID]
```

---

## ✅ What This APK Includes

✅ User Authentication (Signup/Login)
✅ Patient Management
✅ Vitals Tracking (Single & Batch)
✅ **Excel Export** (Primary Feature)
✅ All features fully functional
✅ Works on Android 5.0+
✅ No Expo Go required after installation

---

## 🎉 That's It!

**Total Time:** ~30 minutes (including build time)
**Cost:** FREE (30 builds/month)
**Technical Difficulty:** EASY

---

## 📚 Need More Details?

See comprehensive guides:
- `LOCAL_APK_GENERATION_GUIDE.md` - Complete guide
- `BUILD_INSTRUCTIONS.md` - Detailed instructions
- `SETUP_COMPLETE_SUMMARY.md` - Full project status

---

**App Status:** ✅ Ready for APK Generation
**Backend Status:** ✅ 100% Tested and Working
**Export Feature:** ✅ Verified Functional

---

**Last Updated:** November 29, 2024
