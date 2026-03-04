import { useState } from 'react'
import { translations, speakText, stopSpeaking, getPageText } from '../services/language'

function PageHeader({ greeting, title, currentLanguage, onToggleLanguage, pageName, patientData, extraData }) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const t = translations[currentLanguage]

  const handleListen = () => {
    if (isSpeaking) {
      stopSpeaking()
      setIsSpeaking(false)
      return
    }
    const text = getPageText(pageName, currentLanguage, patientData, extraData)
    speakText(text, currentLanguage)
    setIsSpeaking(true)
    const wordCount = text.split(' ').length
    const estimatedMs = (wordCount / 2.5) * 1000
    setTimeout(() => setIsSpeaking(false), estimatedMs + 1000)
  }

  return (
    <div className="header">
      <div className="header-top">
        <div>
          <div className="greeting">{greeting}</div>
          <div className="user-name">{title}</div>
        </div>
        <div className="header-buttons">
          <div className="header-btn-container">
            <button className={`listen-btn ${isSpeaking ? 'listen-btn-active' : ''}`} onClick={handleListen}>
              <i className={`fas ${isSpeaking ? 'fa-stop-circle' : 'fa-volume-up'}`}></i>
              {isSpeaking ? t.stop : t.listen}
            </button>
            <div className="btn-subtitle">{t.clickToListen}</div>
          </div>
          <div className="header-btn-container">
            <button className="lang-btn" onClick={onToggleLanguage}>
              <i className="fas fa-globe"></i> {t.language}
            </button>
            <div className="btn-subtitle">{t.clickToChange}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PageHeader
