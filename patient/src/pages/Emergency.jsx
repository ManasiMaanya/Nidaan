import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { storage } from '../services/storage'
import PageHeader from '../components/PageHeader'
import { translations } from '../services/language'

function Emergency({ patientData, currentLanguage, onToggleLanguage }) {
  const [qrUrl, setQrUrl] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(600)
  const timerRef = useRef(null)

  const activateEmergencyQR = async () => {
    const emergencyData = {
      sessionId: `emergency-${Date.now()}`,
      patientId: 'patient-123',
      mode: 'emergency',
      data: {
        name: patientData.name,
        age: patientData.age,
        bloodGroup: patientData.bloodGroup,
        allergies: patientData.allergies,
        medicalConditions: patientData.medicalConditions,
        currentMedications: patientData.currentMedications,
        emergencyContact: patientData.emergencyContact
      },
      createdAt: Date.now(),
      expiresAt: Date.now() + (10 * 60 * 1000)
    }
    const qrString = await QRCode.toDataURL(JSON.stringify(emergencyData))
    setQrUrl(qrString)
    setShowQR(true)
    await storage.addSession(emergencyData)
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setShowQR(false); setTimeRemaining(600); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const cancelEmergency = () => {
    clearInterval(timerRef.current)
    setShowQR(false)
    setTimeRemaining(600)
  }

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current) } }, [])

  if (!patientData) return <div>Loading...</div>
  const t = translations[currentLanguage]

  return (
    <div className="page emergency-page">
      <PageHeader
        greeting={t.emergencySOS}
        title={t.showScreen}
        currentLanguage={currentLanguage}
        onToggleLanguage={onToggleLanguage}
        pageName="emergency"
        patientData={patientData}
      />

      {!showQR ? (
        <>
          <div className="emergency-info-card">
            <div className="emergency-section">
              <div className="sos-info-title"><i className="fas fa-tint"></i> {t.bloodGroup}</div>
              <div className="sos-info-value">{patientData.bloodGroup}</div>
            </div>
            <div className="emergency-section">
              <div className="sos-info-title"><i className="fas fa-allergies"></i> {t.allergies}</div>
              <div className="sos-info-list">
                {patientData.allergies.map((allergy, i) => (
                  <div key={i} className="sos-list-item"><i className="fas fa-arrow-right"></i> {allergy}</div>
                ))}
              </div>
            </div>
            <div className="emergency-section">
              <div className="sos-info-title"><i className="fas fa-heartbeat"></i> {t.medicalConditions}</div>
              <div className="sos-info-list">
                {patientData.medicalConditions.map((condition, i) => (
                  <div key={i} className="sos-list-item"><i className="fas fa-circle"></i> {condition}</div>
                ))}
              </div>
            </div>
            <div className="emergency-section">
              <div className="sos-info-title"><i className="fas fa-pills"></i> {t.currentMedications}</div>
              <div className="sos-info-list">
                {patientData.currentMedications.map((med, i) => (
                  <div key={i} className="sos-list-item"><i className="fas fa-circle"></i> {med}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="emergency-actions">
            <button className="emergency-btn activate-btn" onClick={activateEmergencyQR}>
              <i className="fas fa-qrcode"></i> {t.showEmergencyQR}
            </button>
            <button className="emergency-btn call-btn" onClick={() => window.location.href = `tel:${patientData.emergencyContact.phone}`}>
              <i className="fas fa-phone-alt"></i> {t.callEmergencyContact}
              <div className="contact-info">{patientData.emergencyContact.name}</div>
            </button>
          </div>
        </>
      ) : (
        <div className="emergency-qr-active">
          <div className="qr-container">
            <img src={qrUrl} alt="Emergency QR" className="emergency-qr" />
          </div>
          <div className="emergency-timer">
            <div className="timer-label"><i className="fas fa-clock"></i> {t.autoExpiresIn}</div>
            <div className="timer-value">
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <p className="emergency-qr-info">{t.emergencyQRInfo}</p>
          <button className="emergency-btn cancel-btn" onClick={cancelEmergency}>
            <i className="fas fa-times"></i> {t.cancel}
          </button>
        </div>
      )}
    </div>
  )
}

export default Emergency
