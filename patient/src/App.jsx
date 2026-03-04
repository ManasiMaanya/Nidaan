import { useState, useEffect } from 'react'
import './App.css'
import Home from './pages/Home'
import Records from './pages/Records'
import RecordDetail from './pages/RecordDetail'
import Profile from './pages/Profile'
import Emergency from './pages/Emergency'
import ShareDoctor from './pages/ShareDoctor'
import ShareFamily from './pages/ShareFamily'
import { storage } from './services/storage'
import { speakText, translations } from './services/language'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [patientData, setPatientData] = useState(null)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [currentLanguage, setCurrentLanguage] = useState('en')

  useEffect(() => { loadPatientData() }, [])

  const loadPatientData = async () => {
    let data = await storage.getPatientProfile()
    if (!data) {
      const defaultPatient = {
        name: 'Ramesh Kumar',
        age: 58,
        gender: 'Male',
        bloodGroup: 'B+',
        phone: '+91 98343 38472',
        emergencyContact: { name: 'Suresh Kumar (Son)', phone: '+91 98735 00000' },
        allergies: ['Penicillin', 'Dust'],
        medicalConditions: ['Type 2 Diabetes', 'Hypertension'],
        currentMedications: ['Metformin 500mg - After Breakfast and Dinner', 'Amlodipine 5mg - Morning']
      }
      await storage.savePatientProfile(defaultPatient)
      data = defaultPatient
    }
    setPatientData(data)
  }

  const handleSelectRecord = (record) => {
    setSelectedRecord(record)
    setCurrentPage('recordDetail')
  }

  const toggleLanguage = () => {
    const langs = ['en', 'hi', 'ta']
    const newLang = langs[(langs.indexOf(currentLanguage) + 1) % langs.length]
    setCurrentLanguage(newLang)
    const messages = {
      en: 'Language changed to English',
      hi: 'भाषा हिंदी में बदल गई',
      ta: 'மொழி தமிழாக மாற்றப்பட்டது'
    }
    speakText(messages[newLang], newLang)
  }

  const pageProps = {
    onNavigate: setCurrentPage,
    currentLanguage,
    onToggleLanguage: toggleLanguage,
    patientData
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home {...pageProps} />
      case 'records': return <Records {...pageProps} onSelectRecord={handleSelectRecord} />
      case 'recordDetail': return <RecordDetail {...pageProps} record={selectedRecord} onBack={() => setCurrentPage('records')} />
      case 'profile': return <Profile {...pageProps} />
      case 'emergency': return <Emergency {...pageProps} />
      case 'shareDoctor': return <ShareDoctor {...pageProps} />
      case 'shareFamily': return <ShareFamily {...pageProps} />
      default: return <Home {...pageProps} />
    }
  }

  if (!patientData) return <div className="loading">Loading...</div>

  const t = translations[currentLanguage]

  return (
    <div className="app">
      {renderPage()}
      <nav className="bottom-nav">
        <div className={`nav-item ${currentPage === 'home' ? 'active' : ''}`} onClick={() => setCurrentPage('home')}>
          <div className="nav-icon"><i className="fas fa-home"></i></div>
          <div className="nav-label">{t.home}</div>
        </div>
        <div className={`nav-item ${currentPage === 'records' ? 'active' : ''}`} onClick={() => setCurrentPage('records')}>
          <div className="nav-icon"><i className="fas fa-file-medical"></i></div>
          <div className="nav-label">{t.records}</div>
        </div>
        <div className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`} onClick={() => setCurrentPage('profile')}>
          <div className="nav-icon"><i className="fas fa-user"></i></div>
          <div className="nav-label">{t.profile}</div>
        </div>
        <div className={`nav-item ${currentPage === 'emergency' ? 'active' : ''}`} onClick={() => setCurrentPage('emergency')}>
          <div className="nav-icon"><i className="fas fa-exclamation-triangle"></i></div>
          <div className="nav-label">{t.sos}</div>
        </div>
      </nav>
    </div>
  )
}

export default App