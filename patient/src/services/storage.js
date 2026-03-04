import localforage from 'localforage'

export const storage = {
  // Patient Profile
  async savePatientProfile(profile) {
    await localforage.setItem('patient_profile', profile)
  },

  async getPatientProfile() {
    return await localforage.getItem('patient_profile')
  },

  // Medical Records
  async getAllRecords() {
    const records = await localforage.getItem('medical_records')
    return records || []
  },

  async addRecord(record) {
    const records = await this.getAllRecords()
    records.push(record)
    await localforage.setItem('medical_records', records)
  },

  // Sessions (Doctor/Emergency)
  async addSession(sessionData) {
    const sessions = await localforage.getItem('active_sessions') || []
    sessions.push(sessionData)
    await localforage.setItem('active_sessions', sessions)
    
    // Also log it
    await this.logSession(sessionData)
  },

  async getSessions() {
    return await localforage.getItem('active_sessions') || []
  },

  async logSession(sessionData) {
    const logs = await localforage.getItem('session_logs') || []
    logs.push({
      ...sessionData,
      loggedAt: Date.now()
    })
    await localforage.setItem('session_logs', logs)
  },

  // Guardians
  async getGuardians() {
    return await localforage.getItem('guardians') || []
  },

  async addGuardian(guardian) {
    const guardians = await this.getGuardians()
    guardians.push(guardian)
    await localforage.setItem('guardians', guardians)
  },

  async revokeGuardian(guardianId) {
    let guardians = await this.getGuardians()
    guardians = guardians.map(g => 
      g.id === guardianId 
        ? { ...g, status: 'revoked', revokedAt: Date.now() }
        : g
    )
    await localforage.setItem('guardians', guardians)
  },

  async updateGuardianAccess(guardianId) {
    let guardians = await this.getGuardians()
    guardians = guardians.map(g => 
      g.id === guardianId 
        ? { ...g, lastAccessedAt: Date.now() }
        : g
    )
    await localforage.setItem('guardians', guardians)
  }
}