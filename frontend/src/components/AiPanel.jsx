// src/components/AIPanel.jsx

import { useState } from 'react'
import { Send, Sparkles, FileText, HelpCircle, X, MessageSquare } from 'lucide-react'
import { summarizeNote, explainNote, askAboutNote, summarizeFile } from '../api/ai'
import { Skeleton } from './Skeleton'
import { cn, getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function AIPanel({ isOpen, onClose, noteId, noteContent, hasFile, fileType }) {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState(null)
  const [activeAction, setActiveAction] = useState(null)

  const handleAction = async (action) => {
    setIsLoading(true)
    setAiResponse(null)
    setActiveAction(action)

    try {
      let res
      switch (action) {
        case 'summarize':
          res = await summarizeNote(noteId)
          setAiResponse(res.data.data.summary)
          break
        case 'explain':
          res = await explainNote(noteId)
          setAiResponse(res.data.data.explanation)
          break
        case 'summarize-file':
          res = await summarizeFile(noteId)
          setAiResponse(res.data.data.summary)
          break
        case 'ask':
          if (!question.trim()) return
          res = await askAboutNote(noteId, question)
          setAiResponse(res.data.data.answer)
          setQuestion('')
          break
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
      setAiResponse(null)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-lg transition-transform duration-300 md:absolute md:bottom-0 md:left-auto md:right-0 md:top-0 md:w-80 md:border-l md:border-t-0">
      <div className="flex h-full max-h-[60vh] flex-col md:max-h-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">AI Assistant</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {/* Summarize */}
            <button
              onClick={() => handleAction('summarize')}
              disabled={isLoading || !noteContent}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50',
                activeAction === 'summarize' && !isLoading && 'ring-2 ring-ring'
              )}
            >
              <FileText className="h-4 w-4" />
              Summarize Note
            </button>

            {/* Explain */}
            <button
              onClick={() => handleAction('explain')}
              disabled={isLoading || !noteContent}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50',
                activeAction === 'explain' && !isLoading && 'ring-2 ring-ring'
              )}
            >
              <HelpCircle className="h-4 w-4" />
              Explain Note
            </button>

            {/* Summarize PDF — only if PDF attached */}
            {hasFile && fileType === 'pdf' && (
              <button
                onClick={() => handleAction('summarize-file')}
                disabled={isLoading}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50',
                  activeAction === 'summarize-file' && !isLoading && 'ring-2 ring-ring)'
                )}
              >
                <FileText className="h-4 w-4" />
                Summarize PDF
              </button>
            )}

            {/* Ask AI */}
            <div className="pt-2">
              <p className="mb-2 text-sm font-medium text-muted-foreground">Ask AI</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && question.trim() && !isLoading) {
                      handleAction('ask')
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1 rounded-md border border-border) bg-background) px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <button
                  onClick={() => handleAction('ask')}
                  disabled={isLoading || !question.trim()}
                  className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* AI Response */}
            {(isLoading || aiResponse) && (
              <div className="mt-4 rounded-lg bg-(--secondary)/50 p-4">
                <p className="mb-2 flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  AI Response
                </p>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-foreground">{aiResponse}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}