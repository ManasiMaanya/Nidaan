import PageHeader from '../components/PageHeader'
import { translations } from '../services/language'

function Home({ onNavigate, patientData, currentLanguage, onToggleLanguage }) {
  if (!patientData) return <div>Loading...</div>
  const t = translations[currentLanguage]

  return (
    <div className="page">
      <PageHeader
        greeting={t.hello}
        title={patientData.name}
        currentLanguage={currentLanguage}
        onToggleLanguage={onToggleLanguage}
        pageName="home"
        patientData={patientData}
      />

      <div className="section-title">{t.whatToDo}</div>

      <div className="actions-grid">
        <div className="action-card light-blue" onClick={() => onNavigate('records')}>
          <div className="card-icon"><i className="fas fa-file-medical-alt"></i></div>
          <div className="card-content">
            <h3>{t.myRecords}</h3>
            <p>{t.viewRecords}</p>
          </div>
        </div>

        <div className="action-card coral" onClick={() => onNavigate('shareDoctor')}>
          <div className="card-icon"><i className="fas fa-user-md"></i></div>
          <div className="card-content">
            <h3>{t.shareDoctor}</h3>
            <p>{t.generateQR}</p>
          </div>
        </div>

        <div className="action-card teal" onClick={() => onNavigate('shareFamily')}>
          <div className="card-icon"><i className="fas fa-users"></i></div>
          <div className="card-content">
            <h3>{t.shareFamily}</h3>
            <p>{t.grantPermanent}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home