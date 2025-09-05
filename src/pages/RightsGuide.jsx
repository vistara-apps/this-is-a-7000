import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import LegalCard from '../components/LegalCard'
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react'

const RightsGuide = () => {
  const { user, language } = useApp()
  const [selectedCategory, setSelectedCategory] = useState('traffic')

  const categories = {
    traffic: {
      en: 'Traffic Stops',
      es: 'Paradas de Tráfico'
    },
    search: {
      en: 'Search & Seizure',
      es: 'Búsqueda e Incautación'
    },
    arrest: {
      en: 'Arrest Rights',
      es: 'Derechos de Arresto'
    },
    protest: {
      en: 'Protest Rights',
      es: 'Derechos de Protesta'
    }
  }

  const rightsContent = {
    traffic: {
      en: {
        title: 'Your Rights During Traffic Stops',
        rights: [
          'You have the right to remain silent beyond providing identification',
          'You can refuse consent to search your vehicle',
          'You have the right to record the interaction',
          'You can ask if you are free to leave',
          'You should keep your hands visible at all times'
        ],
        whatToDo: [
          'Pull over safely and turn off the engine',
          'Keep your hands on the steering wheel',
          'Provide license, registration, and insurance when asked',
          'Remain calm and polite',
          'If recording, announce it clearly'
        ],
        whatNotToSay: [
          'Don\'t volunteer information beyond what\'s required',
          'Don\'t consent to searches unless legally required',
          'Don\'t argue or become confrontational',
          'Don\'t resist even if you believe the stop is unlawful',
          'Don\'t lie or provide false information'
        ]
      },
      es: {
        title: 'Tus Derechos Durante Paradas de Tráfico',
        rights: [
          'Tienes derecho a permanecer en silencio más allá de proporcionar identificación',
          'Puedes negarte a consentir la búsqueda de tu vehículo',
          'Tienes derecho a grabar la interacción',
          'Puedes preguntar si eres libre de irte',
          'Debes mantener tus manos visibles en todo momento'
        ],
        whatToDo: [
          'Detente de manera segura y apaga el motor',
          'Mantén tus manos en el volante',
          'Proporciona licencia, registro y seguro cuando se solicite',
          'Mantente calmado y educado',
          'Si grabas, anúncialo claramente'
        ],
        whatNotToSay: [
          'No ofrezcas información más allá de lo requerido',
          'No consientas a búsquedas a menos que sea legalmente requerido',
          'No discutas o te vuelvas confrontacional',
          'No resistas aunque creas que la parada es ilegal',
          'No mientas o proporciones información falsa'
        ]
      }
    }
  }

  const currentContent = rightsContent[selectedCategory]?.[language] || rightsContent.traffic.en

  const handleShare = () => {
    const shareText = `${currentContent.title}\n\nYour Rights:\n${currentContent.rights.join('\n')}`
    if (navigator.share) {
      navigator.share({
        title: currentContent.title,
        text: shareText
      })
    } else {
      navigator.clipboard.writeText(shareText)
    }
  }

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-display text-text-primary mb-2">
            {language === 'en' ? 'Know Your Rights' : 'Conoce Tus Derechos'}
          </h2>
          <p className="text-body text-text-secondary">
            {language === 'en' 
              ? `Legal information for ${user.location?.state || 'your area'}` 
              : `Información legal para ${user.location?.state || 'tu área'}`}
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(categories).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === key
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            {value[language]}
          </button>
        ))}
      </div>

      {/* Main Rights Card */}
      <LegalCard
        title={currentContent.title}
        type="sharing"
        onShare={handleShare}
        onCopy={() => handleCopy(currentContent.rights.join('\n'))}
        content={
          <div className="space-y-4">
            <div className="flex items-center text-green-600 mb-3">
              <Shield className="h-5 w-5 mr-2" />
              <span className="font-medium">
                {language === 'en' ? 'Your Rights:' : 'Tus Derechos:'}
              </span>
            </div>
            <ul className="space-y-2">
              {currentContent.rights.map((right, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span>{right}</span>
                </li>
              ))}
            </ul>
          </div>
        }
      />

      {/* What To Do */}
      <LegalCard
        title={language === 'en' ? 'What To Do' : 'Qué Hacer'}
        content={
          <ul className="space-y-2">
            {currentContent.whatToDo.map((item, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-4 w-4 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        }
        onCopy={() => handleCopy(currentContent.whatToDo.join('\n'))}
      />

      {/* What Not To Say */}
      <LegalCard
        title={language === 'en' ? 'What Not To Say' : 'Qué No Decir'}
        content={
          <ul className="space-y-2">
            {currentContent.whatNotToSay.map((item, index) => (
              <li key={index} className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        }
        onCopy={() => handleCopy(currentContent.whatNotToSay.join('\n'))}
      />

      {/* Emergency Contact Info */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="font-medium text-red-800 mb-2">
          {language === 'en' ? 'Emergency Contacts' : 'Contactos de Emergencia'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-red-700">
          <div>
            <p className="font-medium">
              {language === 'en' ? 'Emergency:' : 'Emergencia:'} 911
            </p>
            <p className="font-medium">
              {language === 'en' ? 'ACLU Rights Hotline:' : 'Línea de Derechos ACLU:'} 1-877-6-PROFILE
            </p>
          </div>
          <div>
            <p className="font-medium">
              {language === 'en' ? 'Legal Aid:' : 'Asistencia Legal:'} 211
            </p>
            <p className="font-medium">
              {language === 'en' ? 'Immigration Help:' : 'Ayuda de Inmigración:'} 1-800-354-0365
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RightsGuide