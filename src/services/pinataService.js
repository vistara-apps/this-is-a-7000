import { config } from './config.js'

class PinataService {
  constructor() {
    this.apiKey = config.pinata.apiKey
    this.secretKey = config.pinata.secretKey
    this.baseURL = config.pinata.baseURL
  }

  async uploadFile(file, metadata = {}) {
    if (!this.apiKey || !this.secretKey) {
      console.warn('Pinata not configured, using local blob URLs')
      return this.createLocalBlob(file, metadata)
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Add metadata
      const pinataMetadata = {
        name: metadata.name || `incident_${Date.now()}`,
        keyvalues: {
          userId: metadata.userId || 'unknown',
          timestamp: metadata.timestamp || new Date().toISOString(),
          type: metadata.type || 'incident_recording',
          ...metadata.customData
        }
      }
      
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata))
      
      // Pinata options
      const pinataOptions = {
        cidVersion: 1,
        wrapWithDirectory: false
      }
      
      formData.append('pinataOptions', JSON.stringify(pinataOptions))

      const response = await fetch(`${this.baseURL}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.secretKey
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Pinata upload error: ${response.status}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        ipfsHash: result.IpfsHash,
        pinSize: result.PinSize,
        timestamp: result.Timestamp,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        metadata: pinataMetadata
      }
    } catch (error) {
      console.error('Error uploading to Pinata:', error)
      return this.createLocalBlob(file, metadata)
    }
  }

  async uploadJSON(jsonData, metadata = {}) {
    if (!this.apiKey || !this.secretKey) {
      console.warn('Pinata not configured, using local storage')
      return this.storeJSONLocal(jsonData, metadata)
    }

    try {
      const pinataMetadata = {
        name: metadata.name || `json_data_${Date.now()}`,
        keyvalues: {
          type: metadata.type || 'json_data',
          timestamp: new Date().toISOString(),
          ...metadata.customData
        }
      }

      const pinataOptions = {
        cidVersion: 1,
        wrapWithDirectory: false
      }

      const response = await fetch(`${this.baseURL}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.secretKey
        },
        body: JSON.stringify({
          pinataContent: jsonData,
          pinataMetadata,
          pinataOptions
        })
      })

      if (!response.ok) {
        throw new Error(`Pinata JSON upload error: ${response.status}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        ipfsHash: result.IpfsHash,
        pinSize: result.PinSize,
        timestamp: result.Timestamp,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        metadata: pinataMetadata
      }
    } catch (error) {
      console.error('Error uploading JSON to Pinata:', error)
      return this.storeJSONLocal(jsonData, metadata)
    }
  }

  async unpinFile(ipfsHash) {
    if (!this.apiKey || !this.secretKey) {
      console.warn('Pinata not configured')
      return { success: false, message: 'Pinata not configured' }
    }

    try {
      const response = await fetch(`${this.baseURL}/pinning/unpin/${ipfsHash}`, {
        method: 'DELETE',
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.secretKey
        }
      })

      if (!response.ok) {
        throw new Error(`Pinata unpin error: ${response.status}`)
      }

      return { success: true, message: 'File unpinned successfully' }
    } catch (error) {
      console.error('Error unpinning file:', error)
      return { success: false, message: error.message }
    }
  }

  async listPinnedFiles(userId = null) {
    if (!this.apiKey || !this.secretKey) {
      console.warn('Pinata not configured, using local storage')
      return this.listLocalFiles(userId)
    }

    try {
      let url = `${this.baseURL}/data/pinList?status=pinned`
      
      if (userId) {
        url += `&metadata[keyvalues][userId]=${userId}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.secretKey
        }
      })

      if (!response.ok) {
        throw new Error(`Pinata list error: ${response.status}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        files: result.rows.map(row => ({
          ipfsHash: row.ipfs_pin_hash,
          size: row.size,
          timestamp: row.date_pinned,
          metadata: row.metadata,
          url: `https://gateway.pinata.cloud/ipfs/${row.ipfs_pin_hash}`
        }))
      }
    } catch (error) {
      console.error('Error listing pinned files:', error)
      return this.listLocalFiles(userId)
    }
  }

  async testAuthentication() {
    if (!this.apiKey || !this.secretKey) {
      return { success: false, message: 'API keys not configured' }
    }

    try {
      const response = await fetch(`${this.baseURL}/data/testAuthentication`, {
        method: 'GET',
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.secretKey
        }
      })

      if (!response.ok) {
        throw new Error(`Authentication test failed: ${response.status}`)
      }

      const result = await response.json()
      return { success: true, message: result.message }
    } catch (error) {
      console.error('Pinata authentication test failed:', error)
      return { success: false, message: error.message }
    }
  }

  // Local fallback methods
  createLocalBlob(file, metadata) {
    const url = URL.createObjectURL(file)
    const localData = {
      success: true,
      ipfsHash: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pinSize: file.size,
      timestamp: new Date().toISOString(),
      url: url,
      metadata: {
        name: metadata.name || file.name,
        keyvalues: {
          userId: metadata.userId || 'unknown',
          timestamp: metadata.timestamp || new Date().toISOString(),
          type: metadata.type || 'incident_recording',
          ...metadata.customData
        }
      },
      isLocal: true
    }

    // Store reference in localStorage for listing
    const localFiles = JSON.parse(localStorage.getItem('kyrh_local_files') || '[]')
    localFiles.push(localData)
    localStorage.setItem('kyrh_local_files', JSON.stringify(localFiles))

    return localData
  }

  storeJSONLocal(jsonData, metadata) {
    const localData = {
      success: true,
      ipfsHash: `local_json_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pinSize: JSON.stringify(jsonData).length,
      timestamp: new Date().toISOString(),
      url: null, // JSON data stored locally
      data: jsonData,
      metadata: {
        name: metadata.name || `json_data_${Date.now()}`,
        keyvalues: {
          type: metadata.type || 'json_data',
          timestamp: new Date().toISOString(),
          ...metadata.customData
        }
      },
      isLocal: true
    }

    // Store in localStorage
    const localFiles = JSON.parse(localStorage.getItem('kyrh_local_files') || '[]')
    localFiles.push(localData)
    localStorage.setItem('kyrh_local_files', JSON.stringify(localFiles))

    return localData
  }

  listLocalFiles(userId = null) {
    const localFiles = JSON.parse(localStorage.getItem('kyrh_local_files') || '[]')
    
    let filteredFiles = localFiles
    if (userId) {
      filteredFiles = localFiles.filter(file => 
        file.metadata?.keyvalues?.userId === userId
      )
    }

    return {
      success: true,
      files: filteredFiles.map(file => ({
        ipfsHash: file.ipfsHash,
        size: file.pinSize,
        timestamp: file.timestamp,
        metadata: file.metadata,
        url: file.url,
        data: file.data,
        isLocal: true
      }))
    }
  }
}

export default new PinataService()
