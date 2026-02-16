# 🎭 Face Recognition Feature - User Guide

## Overview

The Face Recognition feature provides an **optional** alternative login method using facial recognition technology. This feature is completely opt-in and does not replace the existing username/password login system.

## ✨ Key Features

- ✅ **Optional Face Login** - Alternative to password-based authentication
- ✅ **Easy Enrollment** - Simple camera-based face capture
- ✅ **Privacy-Focused** - Face data can be deleted anytime
- ✅ **Enable/Disable Toggle** - Turn face recognition on/off without deleting data
- ✅ **Audit Logging** - All face recognition attempts are logged
- ✅ **Real-time Detection** - Live face detection feedback during enrollment and login
- ✅ **High Accuracy** - Uses face-api.js with TensorFlow.js backend

## 🚀 How to Use

### For Users

#### 1. Enrolling Your Face

1. **Login** to your account using username/password
2. Go to your **Profile** page
3. Click the **purple camera icon** (Face Recognition button)
4. In the modal, click **"Start Camera"**
5. Position your face in the camera view
   - Make sure your face is well-lit
   - Look directly at the camera
   - Wait for the green "Face Detected" indicator
6. Click **"Capture & Enroll"**
7. Wait for confirmation message

#### 2. Logging in with Face Recognition

1. On the **Login** page, click **"Login with Face Recognition"**
2. Allow camera access when prompted
3. Position your face in the camera view
4. Click **"Verify Face"** when your face is detected
5. Wait for verification and automatic login

#### 3. Managing Face Recognition

**Enable/Disable:**
- Go to Profile → Click Face Recognition button
- Toggle the "Enable Face Recognition Login" switch

**Delete Face Data:**
- Go to Profile → Click Face Recognition button
- Click "Delete Face Data" button
- Confirm deletion

**Re-enroll:**
- Go to Profile → Click Face Recognition button
- Click "Re-enroll Face" button
- Follow enrollment steps again

## 🔒 Security & Privacy

### What Data is Stored?

- **Face Descriptor**: A mathematical representation of your face (128 numbers)
- **NOT stored**: Actual photos or images of your face
- **Encrypted**: Face descriptors are stored securely in the database

### Privacy Controls

- ✅ **Opt-in Only**: Face recognition is disabled by default
- ✅ **User Control**: You can delete your face data anytime
- ✅ **Audit Trail**: All attempts are logged for security
- ✅ **No Sharing**: Your face data is never shared or exported

### Security Measures

- 🔐 **Liveness Detection**: Prevents photo spoofing (coming soon)
- 🔐 **Confidence Threshold**: Only matches above 60% confidence
- 🔐 **Attempt Limiting**: Falls back to password after failed attempts
- 🔐 **Encrypted Storage**: Face descriptors are encrypted at rest

## 🛠️ Technical Details

### Technology Stack

- **Frontend**: face-api.js (TensorFlow.js)
- **Models**: 
  - Tiny Face Detector
  - Face Landmark 68
  - Face Recognition Net
  - SSD MobileNet v1
- **Backend**: Node.js/Express
- **Database**: MySQL

### API Endpoints

```
POST   /api/face-recognition/enroll           - Enroll face
POST   /api/face-recognition/verify           - Verify face for login
GET    /api/face-recognition/status/:id       - Get enrollment status
PUT    /api/face-recognition/toggle/:id       - Enable/disable
DELETE /api/face-recognition/delete/:id       - Delete face data
GET    /api/face-recognition/logs/:id         - Get audit logs
```

### Database Tables

**face_recognition**
- Stores face descriptors and enrollment status
- One record per personnel

**face_recognition_logs**
- Audit trail of all face recognition events
- Includes confidence scores and timestamps

## 📊 Performance

- **Enrollment Time**: ~2-3 seconds
- **Verification Time**: ~1-2 seconds
- **Model Loading**: ~3-5 seconds (first time only)
- **Accuracy**: ~95% under good lighting conditions

## 🎯 Best Practices

### For Best Results:

1. **Lighting**: Ensure your face is well-lit from the front
2. **Position**: Look directly at the camera
3. **Distance**: Keep your face 30-60cm from the camera
4. **Expression**: Use a neutral expression
5. **Consistency**: Enroll and login in similar lighting conditions

### Troubleshooting:

**"No Face Detected"**
- Check camera permissions
- Improve lighting
- Move closer to camera
- Remove glasses or hat

**"Face Not Recognized"**
- Try better lighting
- Re-enroll your face
- Use password login as fallback

**Camera Not Working**
- Check browser permissions
- Try a different browser
- Ensure camera is not in use by another app

## 🔄 Fallback Options

Face recognition is **optional** and **supplementary**. You can always:
- ✅ Use username/password login
- ✅ Disable face recognition anytime
- ✅ Delete your face data
- ✅ Re-enroll if needed

## 📱 Browser Compatibility

### Supported Browsers:
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Edge 79+
- ✅ Safari 11+
- ✅ Opera 47+

### Requirements:
- 📷 Webcam or front camera
- 🌐 HTTPS connection (for camera access)
- 💾 ~10MB for model files (cached after first load)

## 🆘 Support

If you encounter issues:

1. **Check this guide** for troubleshooting tips
2. **Try password login** as an alternative
3. **Contact PMD-IT** for technical support
4. **Check browser console** for error messages

## 📝 Changelog

### Version 1.0.0 (February 2026)
- ✅ Initial release
- ✅ Face enrollment
- ✅ Face login
- ✅ Enable/disable toggle
- ✅ Face data deletion
- ✅ Audit logging

### Upcoming Features:
- 🔜 Liveness detection
- 🔜 Multi-face enrollment
- 🔜 Attendance integration
- 🔜 Admin dashboard
- 🔜 Confidence threshold settings

## ⚖️ Legal & Compliance

- **Consent**: By enrolling, you consent to face data storage
- **Purpose**: Face data is used solely for authentication
- **Retention**: Face data is deleted when you request deletion
- **Access**: Only you and authorized admins can access your face data

---

**Questions?** Contact PMD-IT Support
**Feedback?** We'd love to hear from you!
