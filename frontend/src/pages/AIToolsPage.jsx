// src/pages/AIToolsPage.jsx
// "AI" must be in caps when naming file

import { useState } from 'react'
import { FileText, HelpCircle, Sparkles, Send } from 'lucide-react'
import { generalChat } from '../api/ai'
import DashboardLayout from '../components/DashboardLayout'
import { Skeleton } from '../components/Skeleton'
import { getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function AIToolsPage() {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState(null)

  const handleChat = async () => {
    if (!message.trim()) return
    setIsLoading(true)
    setAiResponse(null)
    try {
      const res = await generalChat(message.trim())
      setAiResponse(res.data.data.response)
      setMessage('')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Tools</h1>
          <p className="mt-1 text-muted-foreground">
            Use AI to summarize, explain, and answer questions about your notes
          </p>
        </div>

        {/* Info cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-3 inline-flex rounded-full bg-(--primary)/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Summarize</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Open any note and click AI → Summarize to get a concise summary
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-3 inline-flex rounded-full bg-(--primary)/10 p-3">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Explain</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Open any note and click AI → Explain for a simple explanation
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-3 inline-flex rounded-full bg-(--primary)/10 p-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Ask AI</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ask questions about your notes or chat freely below
            </p>
          </div>
        </div>

        {/* General chat */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-1 font-semibold text-foreground">General AI Chat</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Ask anything — no note context required
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask AI anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleChat()}
              disabled={isLoading}
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
            <button
              onClick={handleChat}
              disabled={isLoading || !message.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* AI Response */}
        {(isLoading || aiResponse) && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Response
            </h2>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-3/6" />
              </div>
            ) : (
              <p className="leading-relaxed text-foreground">{aiResponse}</p>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border bg-(--secondary)/30 p-6">
          <h3 className="mb-3 font-semibold text-foreground">💡 Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Open a note and click the <strong>AI</strong> button in the toolbar to use AI on that specific note</li>
            <li>• Attach a PDF to a note and use <strong>Summarize PDF</strong> to get AI to read and summarize the document</li>
            <li>• Use <strong>Ask AI</strong> inside a note to ask questions about that note's content</li>
            <li>• Use the chat above for general questions not related to any note</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}