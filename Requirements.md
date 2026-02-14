# Nidaan - Requirements Document

## Functional Requirements

### FR1: Patient Health Records Management
- Store medical records locally with encryption
- Support multiple record types (lab reports, prescriptions, doctor notes, imaging)
- Organize records in chronological timeline
- Allow patient upload and management of records
- Display doctor-verified vs patient-uploaded status

### FR2: QR-Based Access Control

**Emergency Mode:**
- Generate QR code from lock screen
- Auto-expire after 10 minutes
- Show only critical data (blood group, allergies, chronic conditions, medications)
- No manual logout required
- Automatic session termination

**Consultation Mode:**
- Patient-initiated QR generation
- Full medical history access
- Manual session termination
- Optional print capability for doctors

### FR3: Medical Simplification (AI-Powered)
- Extract medical terms from reports using NLP
- Generate plain language explanations
- Context-aware based on severity and patient history
- Preserve original medical records
- Work offline where possible

### FR4: Multi-Language Support
- Translate simplified explanations to regional languages (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati)
- Maintain medical accuracy in translation
- Text-to-speech playback support

### FR5: Offline-First Operation
- Core features work without internet
- Local encrypted storage (IndexedDB)
- Sync when network available
- Emergency access works offline

### FR6: Guardian/Family Access
- QR-based guardian access requests
- Patient approval required
- Revocable access
- Activity logging
- Parent-controlled child profiles (auto-transfer at age 18)

### FR7: Audit Logging
- Log all data access attempts
- Track who accessed, when, duration, what was viewed
- Display access history to patients
- Immutable audit trail

### FR8: Doctor Verification System
- License-based registration
- Manual admin verification
- Verified digital identity badge
- Optional API check against medical registry

## Non-Functional Requirements

### NFR1: Performance
- Load on low-end smartphones (2GB RAM)
- Patient records load within 2 seconds
- QR generation within 1 second
- Minimal battery/CPU usage

### NFR2: Security
- AES-256-GCM encryption for data at rest
- TLS 1.3 for data in transit
- No centralized password storage
- Patient-controlled encryption keys
- Time-limited access tokens
- Auto-expiring sessions

### NFR3: Privacy
- Data stored locally by default
- No data sharing without explicit consent
- Patient controls all access
- Optional end-to-end encrypted cloud backup
- Transparent audit logging

### NFR4: Accessibility
- Text-to-speech for all content
- Large touch targets (48px minimum)
- High contrast colors
- Simple navigation
- Support for screen readers

### NFR5: Usability
- Installable as PWA (no app store required)
- Simple UI with minimal text
- Icon-driven navigation
- Works on low-end devices
- Minimal user training required

### NFR6: Reliability
- Works offline without degradation
- Handles network failures gracefully
- Data persistence across app restarts
- Secure data recovery mechanisms

## Data Requirements

### Patient Data
- Demographics (name, DOB, blood group, gender)
- Emergency contact
- Critical health info (allergies, chronic conditions, current medications)
- Medical history
- Lab reports
- Prescriptions
- Doctor notes
- Imaging reports

### Access Control Data
- QR tokens (encrypted, time-limited)
- Active sessions
- Guardian relationships
- Permission grants

### Audit Data
- Access timestamps
- Accessor identity
- Actions performed
- Session duration

## Technology Stack

### Frontend (Patient PWA)
- React.js (Vite or Next.js)
- CSS Modules / Plain CSS
- Service Workers (offline capability)
- IndexedDB (local database)
- Web Crypto API (AES-256 encryption)
- qrcode.js (QR generation)
- Web Speech API (Text-to-Speech)
- PWA installability (Add to Home Screen)

### Frontend (Doctor Dashboard)
- React.js
- CSS / SCSS / Material UI (optional)
- html5-qrcode or jsQR (webcam scanning)
- Temporary session logic (in-memory only)
- Auto-expiry mechanism

### Backend
- FastAPI (Python)
- JWT authentication
- Passlib/bcrypt (password hashing)
- Role-Based Access Control
- RESTful API design
- Stateless architecture

### Database
- MongoDB Atlas (cloud-hosted)
- Collections: users, medical_records, audit_logs, access_tokens, doctor_verifications
- Motor (async MongoDB driver)

### AI/NLP
- OpenAI API (medical simplification)
- Translation API (regional languages)
- Lightweight on-device NLP (where possible)
- Cloud-based for complex processing
