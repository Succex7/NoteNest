// src/pages/LandingPage.jsx

import { Link } from 'react-router-dom'
import { FileText, FolderOpen, Sparkles, Upload, ArrowRight, Check } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'

const features = [
  { icon: FileText, title: 'Smart Notes', description: 'Create and organize your notes with a clean, intuitive editor.' },
  { icon: FolderOpen, title: 'Folders', description: 'Keep your notes organized with custom folders.' },
  { icon: Sparkles, title: 'AI Summarize', description: 'Get instant summaries and explanations powered by AI.' },
  { icon: Upload, title: 'File Uploads', description: 'Attach files to your notes and summarize PDFs with AI.' },
]

const benefits = [
  'Free to use', 'Dark mode support', 'Mobile friendly',
  'AI-powered features', 'Secure and private', 'No account limits',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-(--background)/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo size="md" href="/" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className="whitespace-nowrap shrink-0 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="whitespace-nowrap shrink-0 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-(--secondary)/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-powered note-taking
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Your AI-powered{' '}
            <span className="text-primary">second brain</span>
          </h1>

          <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
            NoteNest helps you capture, organize, and understand your notes with the power of AI.
            Create folders, upload files, and get instant summaries.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Login to your account
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-(--secondary)/30 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Everything you need</h2>
            <p className="text-lg text-muted-foreground">
              Powerful features to help you capture and organize your thoughts.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md">
                <div className="mb-4 inline-flex rounded-lg bg-(--primary)/10 p-3">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-2xl bg-primary p-8 text-center md:p-12">
            <h2 className="mb-4 text-2xl font-bold text-primary-foreground md:text-3xl">
              Ready to get started?
            </h2>
            <p className="mb-8 text-(--primary-foreground)/80">
              Join thousands of users who trust NoteNest for their note-taking needs.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-md bg-background px-6 py-3 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
            >
              Create your free account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Logo size="sm" href="/" />
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} NoteNest. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}