import { config } from './config.js'

class OpenAIService {
  constructor() {
    this.apiKey = config.openai.apiKey
    this.baseURL = config.openai.baseURL
  }

  async generateScript(scenario, location, language = 'en') {
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured')
      return this.getFallbackScript(scenario, language)
    }

    try {
      const prompt = this.buildScriptPrompt(scenario, location, language)
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a legal assistant helping people understand their rights during police interactions. Provide clear, calm, and legally sound phrases.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      return {
        text: data.choices[0].message.content.trim(),
        generated: true,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error generating script:', error)
      return this.getFallbackScript(scenario, language)
    }
  }

  async generateRightsGuide(location, language = 'en') {
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured')
      return this.getFallbackRightsGuide(location, language)
    }

    try {
      const prompt = this.buildRightsPrompt(location, language)
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a legal expert providing accurate information about constitutional rights during police encounters. Focus on practical, actionable advice.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.2
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      return {
        content: data.choices[0].message.content.trim(),
        generated: true,
        location: location,
        language: language,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error generating rights guide:', error)
      return this.getFallbackRightsGuide(location, language)
    }
  }

  buildScriptPrompt(scenario, location, language) {
    const locationText = location?.state || 'general jurisdiction'
    const langText = language === 'es' ? 'Spanish' : 'English'
    
    return `Generate a calm, respectful de-escalation script for a ${scenario} scenario in ${locationText}. 
    The script should be in ${langText} and help someone assert their rights while remaining cooperative. 
    Keep it under 50 words and focus on constitutional rights.`
  }

  buildRightsPrompt(location, language) {
    const locationText = location?.state || 'general jurisdiction'
    const langText = language === 'es' ? 'Spanish' : 'English'
    
    return `Provide a concise guide about constitutional rights during police encounters in ${locationText}. 
    Write in ${langText} and include: 1) Right to remain silent, 2) Right to refuse searches, 3) Right to record, 
    4) What to do if detained. Keep it practical and under 200 words.`
  }

  getFallbackScript(scenario, language) {
    const scripts = {
      traffic: {
        en: "Officer, I understand you stopped me. I want to exercise my right to remain silent. I will provide my license, registration, and insurance as required by law.",
        es: "Oficial, entiendo que me detuvo. Quiero ejercer mi derecho a permanecer en silencio. Proporcionaré mi licencia, registro y seguro según lo requiere la ley."
      },
      detention: {
        en: "I am invoking my right to remain silent and my right to an attorney. I will not answer any questions without my lawyer present.",
        es: "Estoy invocando mi derecho a permanecer en silencio y mi derecho a un abogado. No responderé ninguna pregunta sin mi abogado presente."
      },
      search: {
        en: "Officer, I do not consent to any search of my vehicle or my person. I am exercising my Fourth Amendment rights.",
        es: "Oficial, no consiento ninguna búsqueda de mi vehículo o mi persona. Estoy ejerciendo mis derechos de la Cuarta Enmienda."
      }
    }

    return {
      text: scripts[scenario]?.[language] || scripts.traffic[language],
      generated: false,
      timestamp: new Date()
    }
  }

  getFallbackRightsGuide(location, language) {
    const guides = {
      en: `Your Constitutional Rights:
      
1. RIGHT TO REMAIN SILENT: You are not required to answer questions beyond providing identification when lawfully requested.

2. RIGHT TO REFUSE SEARCHES: You can refuse consent to search your person, vehicle, or belongings unless there's a warrant or probable cause.

3. RIGHT TO RECORD: You have the right to record police interactions in public spaces.

4. IF DETAINED: Ask "Am I free to leave?" If not, you are being detained and should clearly state you are exercising your right to remain silent and want an attorney.

Stay calm, keep your hands visible, and never physically resist.`,
      es: `Sus Derechos Constitucionales:

1. DERECHO A PERMANECER EN SILENCIO: No está obligado a responder preguntas más allá de proporcionar identificación cuando se solicite legalmente.

2. DERECHO A RECHAZAR BÚSQUEDAS: Puede rechazar el consentimiento para registrar su persona, vehículo o pertenencias a menos que haya una orden judicial o causa probable.

3. DERECHO A GRABAR: Tiene derecho a grabar interacciones policiales en espacios públicos.

4. SI ES DETENIDO: Pregunte "¿Soy libre de irme?" Si no, está siendo detenido y debe declarar claramente que está ejerciendo su derecho a permanecer en silencio y quiere un abogado.

Manténgase calmado, mantenga las manos visibles y nunca resista físicamente.`
    }

    return {
      content: guides[language],
      generated: false,
      location: location,
      language: language,
      timestamp: new Date()
    }
  }
}

export default new OpenAIService()
