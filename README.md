# Nidaan - Patient-Owned Digital Health Records

## Overview

Nidaan is a patient-owned digital health record system built for rural and low-resource environments. It works offline, runs on low-end smartphones, and makes medical information simple and accessible through AI-powered simplification and regional language translation.

## Key Features

-  **Patient-Controlled Identity** - No centralized login server, encrypted local storage
-  **Emergency Health Capsule** - Lock-screen QR with auto-expiring access
-  **Medical Simplifier** - AI-powered plain language explanations
-  **Multi-Language Support** - Regional language translations
-  **Offline-First** - Core features work without internet
-  **Audit Logs** - Complete transparency of data access
-  **Guardian Access** - Family member access with patient approval
-  **Doctor Verification** - License-based verification system
-  **Text-to-Speech** - Accessibility for elderly and low-literacy users

## Technology Stack

### Patient PWA (Progressive Web App)
- **Frontend:** React.js, CSS
- **Offline:** Service Workers, IndexedDB
- **Security:** Web Crypto API (AES-256 encryption)
- **Features:** qrcode.js, Web Speech API

### Doctor Dashboard
- **Frontend:** React.js
- **QR Scanning:** html5-qrcode
- **Session:** In-memory only (no persistent storage)

### Backend API
- **Framework:** FastAPI (Python)
- **Auth:** JWT tokens
- **Security:** bcrypt, Role-based access control

### Database
- **Primary:** MongoDB Atlas
- **Collections:** users, medical_records, audit_logs, access_tokens

### AI/NLP
- **Simplification:** OpenAI API or similar
- **Translation:** Translation API
- **On-Device:** Lightweight NLP where possible

## Architecture

```
Patient PWA (Offline-First)
         ↓
   Local Storage (Encrypted)
         ↓
   QR Code Generation
         ↓
   Doctor Scans QR
         ↓
   Secure Access Layer (Token Validation)
         ↓
   Doctor Dashboard (Read-Only/Add Notes)
         ↓
   Audit Logging
```

## Unique Selling Points

1. **QR-Based Access** - Two modes (emergency & consultation) with time-limited access
2. **Offline Architecture** - Works without internet, critical for rural areas
3. **Patient-Owned** - Data controlled by patient, not hospitals
4. **AI Simplification** - Makes medical information understandable
5. **Low-End Optimized** - Runs on smartphones with 2GB RAM


## Future Roadmap

- [ ] Hospital EHR integration
- [ ] Wearable device data sync
- [ ] Medication reminders
- [ ] Health analytics dashboard
- [ ] Telemedicine integration
- [ ] Insurance claim assistance
- [ ] Multi-device sync

**Built with ♡ for improving healthcare accessibility in India**
