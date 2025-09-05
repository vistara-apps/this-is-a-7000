import React, { useState } from 'react'
import { Copy, CheckCircle } from 'lucide-react'

const ScriptButton = ({ script, variant = 'primary', language = 'en' }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(script.text[language])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-blue-600',
    secondary: 'bg-gray-100 text-text-primary hover:bg-gray-200 border'
  }

  return (
    <div className={`rounded-lg p-4 ${variantStyles[variant]} transition-colors cursor-pointer group`}
         onClick={handleCopy}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium mb-2">{script.title[language]}</h4>
          <p className="text-sm opacity-90">{script.text[language]}</p>
        </div>
        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {copied ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <Copy className="h-5 w-5" />
          )}
        </div>
      </div>
    </div>
  )
}

export default ScriptButton