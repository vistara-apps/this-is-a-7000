import React from 'react'
import { Share2, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'

const LegalCard = ({ title, content, type = 'default', onShare, onCopy }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (onCopy) {
      onCopy(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={`rounded-lg p-6 shadow-card border ${
      type === 'sharing' ? 'gradient-card border-purple-200' : 'bg-surface'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-heading text-text-primary">{title}</h3>
        <div className="flex space-x-2">
          {onCopy && (
            <button
              onClick={handleCopy}
              className="p-2 text-text-secondary hover:text-primary transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="p-2 text-text-secondary hover:text-primary transition-colors"
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="text-body text-text-primary space-y-3">
        {typeof content === 'string' ? (
          <p>{content}</p>
        ) : (
          content
        )}
      </div>
    </div>
  )
}

export default LegalCard