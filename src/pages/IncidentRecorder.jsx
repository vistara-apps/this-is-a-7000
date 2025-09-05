import React, { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import RecordButton from '../components/RecordButton'
import { Video, Save, Trash2, MapPin, Clock } from 'lucide-react'

const IncidentRecorder = () => {
  const { user, language, isRecording, setIsRecording, incidents, setIncidents } = useApp()
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [currentRecording, setCurrentRecording] = useState(null)
  const [notes, setNotes] = useState('')
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)

  const startRecording = async () => {
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      streamRef.current = stream
      mediaRecorderRef.current = new MediaRecorder(stream)
      
      const chunks = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setCurrentRecording({
          blob,
          url,
          timestamp: new Date(),
          duration: recordingDuration
        })
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      
      // Start duration timer
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Error accessing media devices:', error)
      alert(language === 'en' 
        ? 'Could not access camera/microphone. Please check permissions.' 
        : 'No se pudo acceder a la cámara/micrófono. Por favor verifica los permisos.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    
    setIsRecording(false)
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const saveRecording = () => {
    if (!currentRecording) return
    
    const newIncident = {
      incidentId: `incident_${Date.now()}`,
      userId: user.userId,
      timestamp: currentRecording.timestamp,
      recordingUrl: currentRecording.url, // In real app, this would be uploaded to Pinata
      location: user.location,
      notes: notes,
      duration: currentRecording.duration
    }
    
    setIncidents(prev => [...prev, newIncident])
    
    // Reset recording state
    setCurrentRecording(null)
    setNotes('')
    setRecordingDuration(0)
    
    alert(language === 'en' 
      ? 'Recording saved successfully!' 
      : '¡Grabación guardada exitosamente!')
  }

  const discardRecording = () => {
    if (currentRecording) {
      URL.revokeObjectURL(currentRecording.url)
    }
    setCurrentRecording(null)
    setNotes('')
    setRecordingDuration(0)
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-display text-text-primary mb-2">
          {language === 'en' ? 'Incident Recorder' : 'Grabador de Incidentes'}
        </h2>
        <p className="text-body text-text-secondary">
          {language === 'en' 
            ? 'Document interactions for your safety and protection' 
            : 'Documenta interacciones para tu seguridad y protección'}
        </p>
      </div>

      {/* Recording Interface */}
      <div className="bg-surface rounded-lg p-8 shadow-card text-center">
        {isRecording && (
          <div className="mb-6">
            <div className="inline-flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              <span className="font-medium">
                {language === 'en' ? 'Recording' : 'Grabando'} - {formatDuration(recordingDuration)}
              </span>
            </div>
          </div>
        )}
        
        <div className="flex justify-center mb-6">
          <RecordButton
            isRecording={isRecording}
            onStartRecord={startRecording}
            onStopRecord={stopRecording}
            variant="urgent"
          />
        </div>
        
        {!isRecording && !currentRecording && (
          <p className="text-text-secondary">
            {language === 'en' 
              ? 'Tap the record button to start documenting an interaction' 
              : 'Toca el botón de grabar para comenzar a documentar una interacción'}
          </p>
        )}
      </div>

      {/* Current Recording Preview */}
      {currentRecording && (
        <div className="bg-surface rounded-lg p-6 shadow-card">
          <h3 className="text-heading text-text-primary mb-4">
            {language === 'en' ? 'Recording Preview' : 'Vista Previa de Grabación'}
          </h3>
          
          <div className="space-y-4">
            <video 
              src={currentRecording.url} 
              controls 
              className="w-full max-w-md mx-auto rounded-lg"
            />
            
            <div className="flex items-center justify-center text-text-secondary space-x-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatDuration(currentRecording.duration)}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{user.location?.state || 'Unknown'}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {language === 'en' ? 'Add Notes (Optional)' : 'Agregar Notas (Opcional)'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={language === 'en' 
                  ? 'Describe the situation, location details, or other relevant information...' 
                  : 'Describe la situación, detalles de ubicación u otra información relevante...'}
                className="w-full p-3 border rounded-lg resize-none h-24"
              />
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={saveRecording}
                className="flex items-center bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Save Recording' : 'Guardar Grabación'}
              </button>
              <button
                onClick={discardRecording}
                className="flex items-center bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Discard' : 'Descartar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Recordings */}
      {incidents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-heading text-text-primary">
            {language === 'en' ? 'Saved Recordings' : 'Grabaciones Guardadas'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidents.map((incident) => (
              <div key={incident.incidentId} className="bg-surface rounded-lg p-4 shadow-card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-text-primary">
                      {new Date(incident.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-text-secondary text-sm">
                      {new Date(incident.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right text-text-secondary text-sm">
                    <p>{formatDuration(incident.duration)}</p>
                    <p>{incident.location?.state}</p>
                  </div>
                </div>
                {incident.notes && (
                  <p className="text-text-secondary text-sm bg-gray-50 p-2 rounded">
                    {incident.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recording Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-800 mb-3">
          {language === 'en' ? 'Recording Tips' : 'Consejos de Grabación'}
        </h4>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>• {language === 'en' 
            ? 'Announce that you are recording for documentation purposes'
            : 'Anuncia que estás grabando para propósitos de documentación'}</li>
          <li>• {language === 'en' 
            ? 'Keep your phone steady and ensure good audio quality'
            : 'Mantén tu teléfono estable y asegúrate de buena calidad de audio'}</li>
          <li>• {language === 'en' 
            ? 'Record the full interaction from beginning to end'
            : 'Graba toda la interacción de principio a fin'}</li>
          <li>• {language === 'en' 
            ? 'Stay calm and avoid interfering with official duties'
            : 'Mantente calmado y evita interferir con deberes oficiales'}</li>
        </ul>
      </div>
    </div>
  )
}

export default IncidentRecorder