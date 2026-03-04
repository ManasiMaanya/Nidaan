import PageHeader from '../components/PageHeader'
import { translations } from '../services/language'

function Profile({ patientData, currentLanguage, onToggleLanguage }) {
  if (!patientData) return <div>Loading...</div>
  const t = translations[currentLanguage]

  return (
    <div className="page">
      <PageHeader
        greeting={t.profile}
        title={t.yourInfo}
        currentLanguage={currentLanguage}
        onToggleLanguage={onToggleLanguage}
        pageName="profile"
        patientData={patientData}
      />

      <div className="card" style={{ margin: '20px' }}>
        <div className="profile-field">
          <label>{t.name}</label>
          <p>{patientData.name}</p>
        </div>
        <div className="profile-field">
          <label>{t.age}</label>
          <p>{patientData.age} {t.years}</p>
        </div>
        <div className="profile-field">
          <label>{t.gender}</label>
          <p>{patientData.gender}</p>
        </div>
        <div className="profile-field">
          <label>{t.phoneNumber}</label>
          <p>{patientData.phone}</p>
        </div>
        <div className="profile-field">
          <label>{t.bloodGroup}</label>
          <p>{patientData.bloodGroup}</p>
        </div>
        <div className="profile-field">
          <label>{t.emergencyContact}</label>
          <p>{patientData.emergencyContact.name}</p>
          <p className="contact-phone">{patientData.emergencyContact.phone}</p>
        </div>
      </div>
    </div>
  )
}

export default Profile