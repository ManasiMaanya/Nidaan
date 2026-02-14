# Nidaan - Design Document

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                  Patient PWA (React)                    │
│  ┌────────────────┐  ┌──────────────────────────────┐   │
│  │ Local Storage  │  │   AI Simplifier (On-Device)  │   │
│  │  (IndexedDB +  │  │   • NLP Engine               │   │
│  │   Encryption)  │  │   • Translator               │   │
│  └────────────────┘  │   • Text-to-Speech           │   │
│          │           └──────────────────────────────┘   │
│  ┌────────────────┐                                     │
│  │ QR Generator   │                                     │
│  └────────────────┘                                     │
└────────────┬────────────────────────────────────────────┘
             │ QR Code (Encrypted Token + Expiry)
             │
             ▼
  ┌──────────────────────────┐
  │   Secure Access Layer    │
  │   (Token Validation)     │
  └──────────┬───────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────┐
│              Doctor Web Dashboard (React)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Emergency   │  │ Consultation │  │   Print      │  │
│  │    Mode      │  │     Mode     │  │   Feature    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                        │
│  • No Permanent Storage                                │
│  • Session-only Data (Memory)                          │
│  • Auto-expiry Enforcement                             │
└────────────────────────────────────────────────────────┘
             │
             ▼
  ┌──────────────────────────┐
  │   Backend API (FastAPI)  │
  │   • JWT Auth             │
  │   • Session Management   │
  │   • Audit Logging        │
  └──────────┬───────────────┘
             │
             ▼
  ┌──────────────────────────┐
  │   Database (MongoDB)     │
  │   • Users                │
  │   • Audit Logs           │
  │   • Doctor Verification  │
  └──────────────────────────┘
```

## Technology Stack

### Patient PWA
**Frontend:**
- React.js (Vite)
- CSS Modules
- Service Workers (offline support)
- Web App Manifest (PWA)

**Storage:**
- IndexedDB (local database)
- Web Crypto API (AES-256 encryption)

**Features:**
- qrcode.js (QR generation)
- Web Speech API (text-to-speech)

**Why PWA:**
- Works on low-end Android phones
- Small bundle size
- No app store required
- Offline-first by design

### Doctor Dashboard
**Frontend:**
- React.js
- CSS/SCSS
- Material-UI (optional)

**QR Scanning:**
- html5-qrcode (webcam)

**Session:**
- Temporary in-memory storage
- Auto-expiry mechanism
- No IndexedDB/localStorage

### Backend API
**Framework:**
- FastAPI (Python)

**Authentication:**
- JWT tokens (short-lived)
- No session storage

**Security:**
- Passlib/bcrypt for password hashing
- Role-based access control

### Database
**Primary:**
- MongoDB Atlas

**Collections:**
- users
- medical_records
- audit_logs
- access_tokens
- doctor_verifications

### AI/NLP
**Medical Simplification:**
- OpenAI API (or similar) for diagnosis simplification
- Cloud-based for complex processing
- Lightweight on-device NLP where possible

**Translation:**
- Translation API for regional languages
- Medical terminology preservation

## Data Models

### Patient Profile
```javascript
{
  id: "UUID",
  name: "string",
  dateOfBirth: "date",
  bloodGroup: "string",
  gender: "string",
  emergencyContact: {
    name: "string",
    phone: "string",
    relationship: "string"
  },
  criticalInfo: {
    allergies: ["string_array"],
    chronicConditions: ["string_array"],
    currentMedications: [
      {
        name: "string",
        dosage: "string",
        frequency: "string"
      }
    ]
  },
  preferences: {
    language: "string",
    voiceEnabled: boolean
  }
}
```

### Medical Record
```javascript
{
  id: "UUID",
  patientId: "UUID",
  type: "lab_report | prescription | doctor_note | imaging",
  title: "string",
  date: "datetime",
  doctor: {
    name: "string",
    specialty: "string",
    verified: boolean
  },
  hospital: "string",
  originalDocument: "base64_encrypted",
  extractedData: {
    diagnoses: ["string_array"],
    medications: [],
    labValues: []
  },
  simplifiedExplanation: {
    summary: "string",
    details: "string",
    translations: {
      "hi": "translated_text",
      "ta": "translated_text"
    }
  },
  status: "verified | uploaded | modified",
  uploadedBy: "doctor_id | patient_id",
  verifiedBy: "doctor_id"
}
```

### Access Token (QR)
```javascript
{
  tokenId: "UUID",
  patientId: "UUID",
  mode: "emergency | consultation",
  createdAt: "datetime",
  expiresAt: "datetime",
  permissions: {
    viewCritical: boolean,
    viewFull: boolean,
    canPrint: boolean
  },
  encryptedPayload: "string",
  signature: "HMAC_SHA256"
}
```

### Audit Log Entry
```javascript
{
  id: "UUID",
  patientId: "UUID",
  accessorId: "UUID",
  accessorName: "string",
  accessorType: "doctor | guardian",
  sessionType: "emergency | consultation",
  startTime: "datetime",
  endTime: "datetime",
  duration: integer,
  actionsPerformed: ["viewed | printed"],
  recordsAccessed: ["record_id_array"]
}
```

## Security Design

### Encryption
**Data at Rest:**
- Algorithm: AES-256-GCM
- Key Derivation: PBKDF2 (100,000 iterations)
- Patient-specific encryption keys
- Random salt per patient

**Data in Transit:**
- TLS 1.3 only
- Certificate pinning in production

### Access Control Flow

**Emergency Mode:**
```
1. Patient activates Emergency Capsule
2. System retrieves critical data locally
3. Generate QR with encrypted token (10-min expiry)
4. Doctor scans QR
5. System validates token signature and expiry
6. Display critical data only (read-only)
7. Auto-revoke after 10 minutes
8. Log access in audit trail
```

**Consultation Mode:**
```
1. Patient taps "Share with Doctor"
2. Generate QR with encrypted token
3. Doctor scans QR
4. System validates token
5. Request patient approval (if first time)
6. Patient approves
7. Doctor views full medical history
8. Doctor can add notes/prescriptions
9. Doctor can print summary
10. Patient manually stops sharing
11. Session terminated
12. Log access in audit trail
```

### Token Structure
```javascript
// Encrypted JWT payload
{
  "sub": "patient_id_encrypted",
  "mode": "emergency" | "consultation",
  "iat": timestamp,
  "exp": timestamp,
  "permissions": {
    "view_critical": true/false,
    "view_full": true/false,
    "can_print": true/false
  }
}
```

## AI Simplification Pipeline

```
Medical Report (PDF/Image)
        ↓
  OCR (if needed)
        ↓
  Text Extraction
        ↓
  NLP Entity Recognition
  • Identify medical terms
  • Extract diagnoses
  • Extract medications
  • Extract lab values
        ↓
  Context Analysis
  • Determine severity
  • Patient history
  • Condition type
        ↓
  Generative AI Simplification
  • Plain language generation
  • Controlled prompts
  • Hallucination prevention
        ↓
  Regional Translation
  • Medical accuracy preservation
  • Cultural sensitivity
        ↓
  Simplified Explanation
  (stored alongside original)
```

## User Interface Design

### Design Principles
- **Simplicity First:** Large fonts (18px min), high contrast
- **Touch-Friendly:** 48px minimum touch targets
- **Icon-Driven:** Minimal text, visual navigation
- **Accessibility:** Screen reader support, voice navigation

### Color Scheme
- Primary: #2563EB (Blue - Trust)
- Success: #10B981 (Green - Verified)
- Error: #EF4444 (Red - Critical)
- Warning: #F59E0B (Orange - Caution)
- Background: #F9FAFB
- Text: #111827

### Key Screens

**Patient App:**
1. Home Screen - Quick actions (My Records, Share, Emergency)
2. Medical Records - Timeline view with cards
3. Record Detail - Simplified + Original + Medical details
4. QR Sharing - Large QR code with timer/status
5. Audit Log - Access history
6. Emergency Capsule - Lock screen widget

**Doctor Dashboard:**
1. QR Scanner - Webcam feed
2. Emergency View - Critical data only
3. Consultation View - Full medical history
4. Print Summary - Formatted PDF generation

## API Design

### Patient Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh

GET    /api/patient/records
POST   /api/patient/records
GET    /api/patient/records/:id
PUT    /api/patient/records/:id
DELETE /api/patient/records/:id

POST   /api/sharing/generate-qr
POST   /api/sharing/revoke
GET    /api/sharing/active-sessions

GET    /api/audit/logs
```

### Doctor Endpoints
```
POST   /api/doctor/auth/register
POST   /api/doctor/auth/verify-license
POST   /api/doctor/auth/login

POST   /api/doctor/access/validate-qr
GET    /api/doctor/access/patient/:id
POST   /api/doctor/access/end-session

POST   /api/doctor/records/add-diagnosis
POST   /api/doctor/records/print-summary
```

## Offline-First Strategy

### Service Worker Strategy
```javascript
// Cache-first for static assets
self.addEventListener('fetch', (event) => {
  if (isStaticAsset(event.request)) {
    event.respondWith(cacheFirst(event.request));
  }
  
  // Network-first for API calls (with fallback)
  if (isAPICall(event.request)) {
    event.respondWith(networkFirst(event.request));
  }
  
  // Offline page for navigation
  if (isNavigation(event.request)) {
    event.respondWith(offlineFirst(event.request));
  }
});
```

### IndexedDB Schema
```
Stores:
- patients (keyPath: id)
- medical_records (keyPath: id, indexes: [patientId, date, type])
- critical_health_data (keyPath: patientId)
- access_tokens (keyPath: tokenId, indexes: [expiresAt, mode])
- audit_log (keyPath: id, indexes: [patientId, startTime])
```

### Sync Strategy
```
- Background sync when network available
- Conflict resolution: last-write-wins
- Encrypted uploads only
- Incremental sync for large files
```

## Future Scope

## Deployment Architecture

### Frontend (PWA)
- **Hosting:** Vercel / Netlify
- **CDN:** Global edge network
- **SSL:** Automatic HTTPS

### Backend API
- **Hosting:** AWS EC2 / DigitalOcean / Render
- **Scaling:** Horizontal with load balancer
- **SSL:** Let's Encrypt

### Database
- **Primary:** MongoDB Atlas (cloud)
- **Backup:** Automated daily backups
- **Scaling:** Automatic sharding

### AI Services
- **Provider:** OpenAI API / Azure Cognitive Services
- **Rate Limiting:** Queue-based processing
- **Fallback:** Cached responses for common terms





