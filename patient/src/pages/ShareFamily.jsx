import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { storage } from '../services/storage'
import PageHeader from '../components/PageHeader'
import { translations } from '../services/language'

function ShareFamily({ onNavigate, currentLanguage, onToggleLanguage, patientData }) {
  const [guardians, setGuardians] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [qrUrl, setQrUrl] = useState('')
  const t = translations[currentLanguage]

  useEffect(() => { loadGuardians() }, [])

  const loadGuardians = async () => {
    const data = await storage.getGuardians()
    setGuardians(data.filter(g => g.status !== 'revoked'))
  }

  const generateGuardianQR = async () => {
    const records = await storage.getAllRecords()
    const guardianData = {
      sessionId: `guardian-${Date.now()}`,
      patientId: 'patient-123',
      mode: 'guardian',
      records,
      createdAt: Date.now(),
      expiresAt: null,
      isPermanent: true
    }
    const qrString = await QRCode.toDataURL(JSON.stringify(guardianData))
    setQrUrl(qrString)
    setShowModal(true)
  }

  const completeGuardianSetup = async () => {
    setShowModal(false)
    const newGuardian = {
      id: Date.now(),
      name: 'Family Member',
      relation: 'Guardian',
      phone: '+91 XXXXX XXXXX',
      grantedAt: new Date().toISOString(),
      lastAccessedAt: null,
      status: 'active'
    }
    await storage.addGuardian(newGuardian)
    loadGuardians()
  }

  const revokeGuardian = async (guardianId) => {
    if (confirm('Are you sure you want to revoke access for this guardian?')) {
      await storage.revokeGuardian(guardianId)
      loadGuardians()
    }
  }

  return (
    <div className="page">
      <PageHeader
        greeting={t.shareFamily}
        title={t.showQRFamily}
        currentLanguage={currentLanguage}
        onToggleLanguage={onToggleLanguage}
        pageName="shareFamily"
        patientData={patientData}
        extraData={{ guardians }}
      />

      <div className="card" style={{ margin: '20px' }}>
        <div className="instruction-box">
          <div className="instruction-text">{t.familyInstruction}</div>
        </div>
        <button className="primary-btn" onClick={generateGuardianQR}>{t.showQR}</button>
      </div>

      <div className="sharing-history">
        <h2>{t.activeGuardians}</h2>
        {guardians.length === 0 ? (
          <div className="empty-state">{t.noGuardians}</div>
        ) : (
          guardians.map(guardian => (
            <div key={guardian.id} className="history-card">
              <div className="history-header">
                <div className="history-person">{guardian.name}</div>
                <div className="history-badge badge-active">{t.active}</div>
              </div>
              <div className="history-details">
                <i className="fas fa-user-friends"></i> {t.relation}: {guardian.relation}<br />
                <i className="fas fa-phone"></i> {guardian.phone}<br />
                {t.granted}: {new Date(guardian.grantedAt).toLocaleDateString()}<br />
                {t.valid}: {t.permanent}
              </div>
              <button className="stop-sharing-btn" onClick={() => revokeGuardian(guardian.id)}>
                <i className="fas fa-ban"></i> {t.revokeAccess}
              </button>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="qr-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="qr-modal-content" onClick={e => e.stopPropagation()}>
            <div className="qr-modal-header">
              <h3>{t.guardianQRTitle}</h3>
              <p>{t.askFamilyToScan}</p>
            </div>
            <div className="qr-modal-qr">
              <img src={qrUrl} alt="Guardian QR" />
            </div>
            <div className="permanent-badge" style={{ margin: '20px 0' }}>
              <i className="fas fa-infinity"></i> {t.permanentAccess}
            </div>
            <p style={{ textAlign: 'center', color: '#5a7184', margin: '16px 0' }}>
              {t.permanentInfo}
            </p>
            <div className="qr-modal-actions">
              <button className="primary-btn" onClick={completeGuardianSetup}>
                <i className="fas fa-check"></i> {t.shareComplete}
              </button>
              <button className="qr-modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i> {t.cancel}
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

export default ShareFamily