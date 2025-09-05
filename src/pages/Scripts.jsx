import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import ScriptButton from '../components/ScriptButton'
import LanguageSelector from '../components/LanguageSelector'
import { openaiService } from '../services'
import { MessageSquare, Star, Sparkles, Loader } from 'lucide-react'

const Scripts = () => {
  const { user, language } = useApp()
  const [selectedCategory, setSelectedCategory] = useState('traffic')
  const [customScripts, setCustomScripts] = useState({})
  const [generatingScript, setGeneratingScript] = useState(false)
  const [generatedScripts, setGeneratedScripts] = useState({})

  const scriptCategories = {
    traffic: {
      en: 'Traffic Stops',
      es: 'Paradas de Tráfico'
    },
    detention: {
      en: 'Detention',
      es: 'Detención'
    },
    search: {
      en: 'Search Requests',
      es: 'Solicitudes de Búsqueda'
    },
    recording: {
      en: 'Recording',
      es: 'Grabación'
    }
  }

  // Generate custom script using OpenAI
  const generateCustomScript = async (scenario, customPrompt = null) => {
    if (user.subscriptionStatus === 'free' && Object.keys(generatedScripts).length >= 3) {
      alert(language === 'en' 
        ? 'Free users can generate up to 3 custom scripts. Upgrade to Premium for unlimited access.' 
        : 'Los usuarios gratuitos pueden generar hasta 3 scripts personalizados. Actualiza a Premium para acceso ilimitado.')
      return
    }

    setGeneratingScript(true)
    
    try {
      const scriptResult = await openaiService.generateScript(scenario, user.location, language)
      
      const scriptKey = `${scenario}_${Date.now()}`
      setGeneratedScripts(prev => ({
        ...prev,
        [scriptKey]: {
          ...scriptResult,
          scenario,
          customPrompt
        }
      }))

      alert(language === 'en' 
        ? 'Custom script generated successfully!' 
        : '¡Script personalizado generado exitosamente!')

    } catch (error) {
      console.error('Error generating script:', error)
      alert(language === 'en' 
        ? 'Error generating script. Please try again.' 
        : 'Error al generar script. Por favor intenta de nuevo.')
    } finally {
      setGeneratingScript(false)
    }
  }

  // Get all scripts for current category (static + generated)
  const getAllScripts = () => {
    const staticScripts = scripts[selectedCategory] || []
    const categoryGeneratedScripts = Object.entries(generatedScripts)
      .filter(([key, script]) => script.scenario === selectedCategory)
      .map(([key, script]) => ({
        title: {
          en: `Custom ${selectedCategory} Script`,
          es: `Script Personalizado de ${scriptCategories[selectedCategory].es}`
        },
        text: {
          en: script.text,
          es: script.text
        },
        generated: true,
        timestamp: script.timestamp
      }))
    
    return [...staticScripts, ...categoryGeneratedScripts]
  }

  const scripts = {
    traffic: [
      {
        title: {
          en: 'Identifying Your Rights',
          es: 'Identificando Tus Derechos'
        },
        text: {
          en: 'Officer, I understand you stopped me. I want to exercise my right to remain silent. I will provide my license, registration, and insurance as required by law.',
          es: 'Oficial, entiendo que me detuvo. Quiero ejercer mi derecho a permanecer en silencio. Proporcionaré mi licencia, registro y seguro según lo requiere la ley.'
        }
      },
      {
        title: {
          en: 'Asking About Detention',
          es: 'Preguntando Sobre Detención'
        },
        text: {
          en: 'Officer, am I free to leave? If not, I understand I am being detained.',
          es: 'Oficial, ¿soy libre de irme? Si no, entiendo que estoy siendo detenido.'
        }
      },
      {
        title: {
          en: 'Refusing Vehicle Search',
          es: 'Negándose a la Búsqueda del Vehículo'
        },
        text: {
          en: 'Officer, I do not consent to any search of my vehicle or my person. I am exercising my Fourth Amendment rights.',
          es: 'Oficial, no consiento ninguna búsqueda de mi vehículo o mi persona. Estoy ejerciendo mis derechos de la Cuarta Enmienda.'
        }
      }
    ],
    detention: [
      {
        title: {
          en: 'Asserting Right to Silence',
          es: 'Afirmando el Derecho al Silencio'
        },
        text: {
          en: 'I am invoking my right to remain silent and my right to an attorney. I will not answer any questions without my lawyer present.',
          es: 'Estoy invocando mi derecho a permanecer en silencio y mi derecho a un abogado. No responderé ninguna pregunta sin mi abogado presente.'
        }
      },
      {
        title: {
          en: 'Requesting Legal Counsel',
          es: 'Solicitando Asesoría Legal'
        },
        text: {
          en: 'I want to speak to a lawyer immediately. I will not answer any questions until my attorney is present.',
          es: 'Quiero hablar con un abogado inmediatamente. No responderé ninguna pregunta hasta que mi abogado esté presente.'
        }
      }
    ],
    recording: [
      {
        title: {
          en: 'Announcing Recording',
          es: 'Anunciando Grabación'
        },
        text: {
          en: 'Officer, I am recording this interaction for my safety and yours. I have the right to record in public.',
          es: 'Oficial, estoy grabando esta interacción por mi seguridad y la suya. Tengo el derecho de grabar en público.'
        }
      },
      {
        title: {
          en: 'Protecting Recording Rights',
          es: 'Protegiendo Derechos de Grabación'
        },
        text: {
          en: 'This recording is for documentation purposes. I am not interfering with your duties.',
          es: 'Esta grabación es para propósitos de documentación. No estoy interfiriendo con sus deberes.'
        }
      }
    ]
  }

  const currentScripts = scripts[selectedCategory] || scripts.traffic

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-display text-text-primary mb-2">
            {language === 'en' ? 'De-escalation Scripts' : 'Scripts de Desescalada'}
          </h2>
          <p className="text-body text-text-secondary">
            {language === 'en' 
              ? 'Pre-written phrases to help navigate difficult interactions' 
              : 'Frases pre-escritas para ayudar a navegar interacciones difíciles'}
          </p>
        </div>
        <LanguageSelector />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(scriptCategories).map(([key, value]) => (
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

      {/* Scripts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {currentScripts.map((script, index) => (
          <ScriptButton
            key={index}
            script={script}
            language={language}
            variant={index % 2 === 0 ? 'primary' : 'secondary'}
          />
        ))}
      </div>

      {/* Usage Tips */}
      <div className="gradient-card rounded-lg p-6 border border-purple-200">
        <div className="flex items-center mb-4">
          <MessageSquare className="h-6 w-6 text-purple-600 mr-3" />
          <h3 className="text-heading text-text-primary">
            {language === 'en' ? 'Usage Tips' : 'Consejos de Uso'}
          </h3>
        </div>
        <ul className="space-y-2 text-text-secondary">
          <li>• {language === 'en' 
            ? 'Speak clearly and calmly when using these phrases'
            : 'Habla claramente y con calma al usar estas frases'}</li>
          <li>• {language === 'en' 
            ? 'Tap any script to copy it to your clipboard'
            : 'Toca cualquier script para copiarlo a tu portapapeles'}</li>
          <li>• {language === 'en' 
            ? 'Practice these phrases so they feel natural'
            : 'Practica estas frases para que se sientan naturales'}</li>
          <li>• {language === 'en' 
            ? 'Remember: your safety is the top priority'
            : 'Recuerda: tu seguridad es la máxima prioridad'}</li>
        </ul>
      </div>

      {/* Premium Upgrade for Free Users */}
      {user.subscriptionStatus === 'free' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <Star className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <h4 className="font-medium text-text-primary">
                {language === 'en' ? 'Get More Scripts with Premium' : 'Obtén Más Scripts con Premium'}
              </h4>
              <p className="text-text-secondary mt-1">
                {language === 'en' 
                  ? 'Access advanced scenarios, custom scripts, and location-specific phrases.' 
                  : 'Accede a escenarios avanzados, scripts personalizados y frases específicas de ubicación.'}
              </p>
              <button className="mt-3 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                {language === 'en' ? 'Upgrade Now' : 'Actualizar Ahora'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Scripts
