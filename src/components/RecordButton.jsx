import React from 'react'
import { Video, Square, AlertCircle } from 'lucide-react'

const RecordButton = ({ isRecording, onStartRecord, onStopRecord, variant = 'urgent' }) => {
  const handleClick = () => {
    if (isRecording) {
      onStopRecord()
    } else {
      onStartRecord()
    }
  }

  const variantStyles = {
    urgent: isRecording 
      ? 'bg-red-500 text-white animate-pulse' 
      : 'bg-red-500 text-white hover:bg-red-600',
    stop: 'bg-gray-500 text-white hover:bg-gray-600'
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center p-6 rounded-full shadow-lg transition-all transform hover:scale-105 ${variantStyles[variant]}`}
    >
      <div className="flex flex-col items-center">
        {isRecording ? (
          <>
            <Square className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Stop Recording</span>
          </>
        ) : (
          <>
            <Video className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Start Recording</span>
          </>
        )}
      </div>
    </button>
  )
}

export default RecordButton