import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { storage } from '../services/storage'
import PageHeader from '../components/PageHeader'
import { translations } from '../services/language'

function ShareDoctor({ onNavigate, currentLanguage, onToggleLanguage, patientData }) {
  const [qrUrl, setQrUrl] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(7200)
  const [sharingHistory, setSharingHistory] = useState([
    { person: 'Dr. Sharma', sharedAt: '2026-02-10 10:30 AM', expiresAt: '2026-02-10 12:30 PM', status: 'expired' },
    { person: 'Dr. Patel', sharedAt: '2026-02-14 02:00 PM', expiresAt: '2026-02-14 04:00 PM', status: 'active' }
  ])
  const timerRef = useRef(null)
  const t = translations[currentLanguage]

  const generateQR = async () => {
    const records = await storage.getAllRecords()
    const sessionData = {
      sessionId: `consultation-${Date.now()}`,
      patientId: 'patient-123',
      mode: 'consultation',
      records,
      createdAt: Date.now(),
      expiresAt: Date.now() + (2 * 60 * 60 * 1000)
    }
    const qrString = await QRCode.toDataURL(JSON.stringify(sessionData))
    setQrUrl(qrString)
    setShowModal(true)
    await storage.addSession(sessionData)
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { endSession(); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const endSession = () => {
    clearInterval(timerRef.current)
    setShowModal(false)
    setQrUrl('')
    setTimeRemaining(7200)
  }

  const stopSharing = (index) => {
    const updated = [...sharingHistory]
    updated[index].status = 'expired'
    setSharingHistory(updated)
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current) } }, [])

  return (
    <div className="page">
      <PageHeader
        greeting={t.shareDoctor}
        title={t.showQRToShare}
        currentLanguage={currentLanguage}
        onToggleLanguage={onToggleLanguage}
        pageName="shareDoctor"
        patientData={patientData}
        extraData={{ sharingHistory }}
      />

      <div className="card" style={{ margin: '20px' }}>
        <div className="instruction-box">
          <div className="instruction-text">{t.sharingInstruction}</div>
        </div>
        <button className="primary-btn" onClick={generateQR}>{t.showQR}</button>
      </div>

      <div className="sharing-history">
        <h2>{t.sharingHistory}</h2>
        {sharingHistory.map((item, index) => (
          <div key={index} className="history-card">
            <div className="history-header">
              <div className="history-person">{item.person}</div>
              <div className={`history-badge ${item.status === 'active' ? 'badge-active' : 'badge-expired'}`}>
                {item.status === 'active' ? t.active : t.expired}
              </div>
            </div>
            <div className="history-details">
              {t.shared}: {item.sharedAt}<br />{t.expires}: {item.expiresAt}
            </div>
            {item.status === 'active' && (
              <button className="stop-sharing-btn" onClick={() => stopSharing(index)}>{t.stopSharing}</button>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="qr-modal-overlay" onClick={endSession}>
          <div className="qr-modal-content" onClick={e => e.stopPropagation()}>
            <div className="qr-modal-header">
              <h3>{t.doctorQRTitle}</h3>
              <p>{t.showCodeToDoctor}</p>
            </div>
            <div className="qr-modal-qr">
              <img src={qrUrl} alt="Doctor QR Code" />
            </div>
            <div className="qr-modal-timer">
              <div className="qr-modal-timer-label">{t.timeRemaining}</div>
              <div className="qr-modal-timer-value">{formatTime(timeRemaining)}</div>
              <div className="qr-modal-timer-info">{t.validFor2Hours}</div>
            </div>
            <div className="qr-modal-actions">
              <button className="qr-modal-stop" onClick={endSession}>
                <i className="fas fa-stop-circle"></i> {t.stopSharing}
              </button>
              <button className="qr-modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i> {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '20px', textAlign: 'center', paddingBottom: '100px' }}>
        <button className="back-btn" onClick={() => onNavigate('home')} style={{ display: 'inline-flex' }}>
          <i className="fas fa-arrow-left"></i> {t.goBack}
        </button>
      </div>
    </div>
  )
}

export default ShareDoctor