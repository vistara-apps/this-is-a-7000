import { config } from './config.js'

class SupabaseService {
  constructor() {
    this.url = config.supabase.url
    this.anonKey = config.supabase.anonKey
    this.headers = {
      'Content-Type': 'application/json',
      'apikey': this.anonKey,
      'Authorization': `Bearer ${this.anonKey}`
    }
  }

  // User Management
  async createUser(userData) {
    if (!this.url || !this.anonKey) {
      console.warn('Supabase not configured, using local storage')
      return this.createUserLocal(userData)
    }

    try {
      const response = await fetch(`${this.url}/rest/v1/users`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating user:', error)
      return this.createUserLocal(userData)
    }
  }

  async updateUser(userId, updates) {
    if (!this.url || !this.anonKey) {
      console.warn('Supabase not configured, using local storage')
      return this.updateUserLocal(userId, updates)
    }

    try {
      const response = await fetch(`${this.url}/rest/v1/users?userId=eq.${userId}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating user:', error)
      return this.updateUserLocal(userId, updates)
    }
  }

  async getUser(userId) {
    if (!this.url || !this.anonKey) {
      console.warn('Supabase not configured, using local storage')
      return this.getUserLocal(userId)
    }

    try {
      const response = await fetch(`${this.url}/rest/v1/users?userId=eq.${userId}`, {
        method: 'GET',
        headers: this.headers
      })

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`)
      }

      const data = await response.json()
      return data[0] || null
    } catch (error) {
      console.error('Error getting user:', error)
      return this.getUserLocal(userId)
    }
  }

  // Incident Management
  async createIncident(incidentData) {
    if (!this.url || !this.anonKey) {
      console.warn('Supabase not configured, using local storage')
      return this.createIncidentLocal(incidentData)
    }

    try {
      const response = await fetch(`${this.url}/rest/v1/incident_reports`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          ...incidentData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating incident:', error)
      return this.createIncidentLocal(incidentData)
    }
  }

  async getUserIncidents(userId) {
    if (!this.url || !this.anonKey) {
      console.warn('Supabase not configured, using local storage')
      return this.getUserIncidentsLocal(userId)
    }

    try {
      const response = await fetch(`${this.url}/rest/v1/incident_reports?userId=eq.${userId}&order=timestamp.desc`, {
        method: 'GET',
        headers: this.headers
      })

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting user incidents:', error)
      return this.getUserIncidentsLocal(userId)
    }
  }

  async deleteIncident(incidentId) {
    if (!this.url || !this.anonKey) {
      console.warn('Supabase not configured, using local storage')
      return this.deleteIncidentLocal(incidentId)
    }

    try {
      const response = await fetch(`${this.url}/rest/v1/incident_reports?incidentId=eq.${incidentId}`, {
        method: 'DELETE',
        headers: this.headers
      })

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Error deleting incident:', error)
      return this.deleteIncidentLocal(incidentId)
    }
  }

  // Legal Content Management
  async getLegalContent(state, type = null) {
    if (!this.url || !this.anonKey) {
      console.warn('Supabase not configured, using local storage')
      return this.getLegalContentLocal(state, type)
    }

    try {
      let url = `${this.url}/rest/v1/legal_content?state=eq.${state}`
      if (type) {
        url += `&type=eq.${type}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      })

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting legal content:', error)
      return this.getLegalContentLocal(state, type)
    }
  }

  async saveLegalContent(contentData) {
    if (!this.url || !this.anonKey) {
      console.warn('Supabase not configured, using local storage')
      return this.saveLegalContentLocal(contentData)
    }

    try {
      const response = await fetch(`${this.url}/rest/v1/legal_content`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(contentData)
      })

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error saving legal content:', error)
      return this.saveLegalContentLocal(contentData)
    }
  }

  // Local Storage Fallbacks
  createUserLocal(userData) {
    const users = JSON.parse(localStorage.getItem('kyrh_users') || '{}')
    users[userData.userId] = {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem('kyrh_users', JSON.stringify(users))
    return users[userData.userId]
  }

  updateUserLocal(userId, updates) {
    const users = JSON.parse(localStorage.getItem('kyrh_users') || '{}')
    if (users[userId]) {
      users[userId] = {
        ...users[userId],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem('kyrh_users', JSON.stringify(users))
    }
    return users[userId]
  }

  getUserLocal(userId) {
    const users = JSON.parse(localStorage.getItem('kyrh_users') || '{}')
    return users[userId] || null
  }

  createIncidentLocal(incidentData) {
    const incidents = JSON.parse(localStorage.getItem('kyrh_incidents') || '[]')
    const newIncident = {
      ...incidentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    incidents.push(newIncident)
    localStorage.setItem('kyrh_incidents', JSON.stringify(incidents))
    return newIncident
  }

  getUserIncidentsLocal(userId) {
    const incidents = JSON.parse(localStorage.getItem('kyrh_incidents') || '[]')
    return incidents
      .filter(incident => incident.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  deleteIncidentLocal(incidentId) {
    const incidents = JSON.parse(localStorage.getItem('kyrh_incidents') || '[]')
    const filtered = incidents.filter(incident => incident.incidentId !== incidentId)
    localStorage.setItem('kyrh_incidents', JSON.stringify(filtered))
    return true
  }

  getLegalContentLocal(state, type) {
    const content = JSON.parse(localStorage.getItem('kyrh_legal_content') || '[]')
    return content.filter(item => {
      const stateMatch = item.state === state || item.state === 'general'
      const typeMatch = !type || item.type === type
      return stateMatch && typeMatch
    })
  }

  saveLegalContentLocal(contentData) {
    const content = JSON.parse(localStorage.getItem('kyrh_legal_content') || '[]')
    content.push(contentData)
    localStorage.setItem('kyrh_legal_content', JSON.stringify(content))
    return contentData
  }
}

export default new SupabaseService()
