import PageHeader from '../components/PageHeader'
import { translations } from '../services/language'

const sampleRecords = [
  {
    id: 1,
    title: 'Blood Test Report',
    doctor: 'Dr. Meena Sharma',
    hospital: 'City General Hospital',
    date: '15 December 2025',
    summary: 'Blood sugar levels slightly elevated. HbA1c at 7.2%. Cholesterol within normal range',
    fullReport: `Complete Blood Count:
• Hemoglobin: 13.2 g/dL (Normal)
• WBC Count: 7,800/μL (Normal)
• Platelet Count: 250,000/μL (Normal)

Lipid Profile:
• Total Cholesterol: 195 mg/dL
• LDL: 120 mg/dL
• HDL: 45 mg/dL
• Triglycerides: 150 mg/dL

Diabetic Panel:
• HbA1c: 7.2% (Elevated - requires management)
• Fasting Blood Sugar: 145 mg/dL (High)

Recommendation: Continue diabetes medication, diet control, and regular monitoring.`,
    simplified: 'Your blood sugar is a bit high. Your HbA1c number shows your body is not controlling sugar properly over the last 3 months. Keep taking your diabetes medicine regularly and eat less sugar and rice. Check your blood sugar every month.'
  },
  {
    id: 2,
    title: 'Eye Check-up Report',
    doctor: 'Dr. Rajiv Patel',
    hospital: 'Vision Care Centre',
    date: '20 November 2025',
    summary: 'Mild cataract in left eye. Early diabetic retinopathy detected',
    fullReport: `Ophthalmology Examination:
• Visual Acuity: Right Eye 6/9, Left Eye 6/12
• Intraocular Pressure: Normal (14 mmHg both eyes)
• Lens Examination: Mild cataract formation in left eye
• Retinal Examination: Early signs of diabetic retinopathy

Diagnosis:
• Mild senile cataract (left eye)
• Background diabetic retinopathy

Recommendation: Regular follow-up every 6 months. Consider cataract surgery if vision deteriorates. Strict diabetic control essential.`,
    simplified: 'Your left eye has a small cloud in the lens (cataract). It is mild now, not an emergency. Your eyes also show early signs of sugar damage. Keep checking your eyes every 6 months. Control your diabetes well to protect your eyes from getting worse.'
  },
  {
    id: 3,
    title: 'X-Ray Report',
    doctor: 'Dr. Anjali Gupta',
    hospital: 'City General Hospital',
    date: '5 September 2025',
    summary: 'Chest X-ray shows normal findings',
    fullReport: `Chest X-Ray PA View:
• Heart size: Normal
• Lung fields: Clear, no infiltrates or consolidation
• Costophrenic angles: Sharp
• Bony thorax: No abnormality detected
• Trachea: Midline

Impression: Normal chest radiograph. No active cardiopulmonary disease.`,
    simplified: 'Your chest X-ray is completely normal. Your heart size is good and your lungs are clear. No problems found.'
  }
]

function Records({ onSelectRecord, currentLanguage, onToggleLanguage, patientData }) {
  const t = translations[currentLanguage]

  return (
    <div className="page">
      <PageHeader
        greeting={t.myRecords}
        title={t.allReports}
        currentLanguage={currentLanguage}
        onToggleLanguage={onToggleLanguage}
        pageName="records"
        patientData={patientData}
        extraData={{ records: sampleRecords }}
      />

      <div className="records-list">
        {sampleRecords.map(record => (
          <div key={record.id} className="record-card" onClick={() => onSelectRecord(record)}>
            <div className="record-header">
              <h3>{record.title}</h3>
              <span className="record-date">{record.date}</span>
            </div>
            <p className="record-doctor"><i className="fas fa-stethoscope"></i> {record.doctor}</p>
            <p className="record-hospital"><i className="fas fa-hospital"></i> {record.hospital}</p>
            <p className="record-summary">{record.summary}</p>
            <div className="record-footer">
              <span className="click-to-view">{t.clickToView} <i className="fas fa-arrow-right"></i></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Records