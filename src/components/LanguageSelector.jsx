import React from 'react'
import { useApp } from '../context/AppContext'

const LanguageSelector = ({ variant = 'default' }) => {
  const { language, setLanguage } = useApp()

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setLanguage('en')}
        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
          language === 'en' 
            ? 'bg-primary text-white' 
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('es')}
        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
          language === 'es' 
            ? 'bg-primary text-white' 
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        Español
      </button>
    </div>
  )
}

export default LanguageSelector