import PageHeader from '../components/PageHeader'
import { translations, speakText } from '../services/language'

function RecordDetail({ record, onBack, currentLanguage, onToggleLanguage, patientData }) {
  if (!record) return <div className="loading">Loading...</div>
  const t = translations[currentLanguage]

  const handleListenSimplified = () => {
    speakText(record.simplified, currentLanguage)
  }

  return (
    <div className="page">
      <PageHeader
        greeting={record.title}
        title={`${record.doctor} • ${record.date}`}
        currentLanguage={currentLanguage}
        onToggleLanguage={onToggleLanguage}
        pageName="recordDetail"
        patientData={patientData}
        extraData={{ record }}
      />

      <div className="record-detail">
        <div className="record-meta">
          <p><i className="fas fa-stethoscope"></i> {record.doctor}</p>
          <p><i className="fas fa-hospital"></i> {record.hospital}</p>
          <p><i className="fas fa-calendar"></i> {record.date}</p>
        </div>

        <div className="card">
          <h3>{t.summary}</h3>
          <div className="summary-box">{record.summary}</div>
        </div>

        <div className="card">
          <h3><i className="fas fa-lightbulb"></i> {t.simplifiedExplanation}</h3>
          <div className="simplified-box">{record.simplified}</div>
          <button className="listen-btn-inline" onClick={handleListenSimplified}>
            <i className="fas fa-volume-up"></i> {t.listenToExplanation}
          </button>
        </div>

        <div className="card">
          <h3>{t.fullReport}</h3>
          <div className="full-report-box">
            <pre>{record.fullReport}</pre>
          </div>
        </div>

        <div style={{ padding: '0 20px 20px' }}>
          <button className="back-btn" onClick={onBack}>
            <i className="fas fa-arrow-left"></i> {t.goBackToReports}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecordDetail