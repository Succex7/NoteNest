// extension/popup.js — NoteNest Chrome Extension Logic

const API_BASE = 'https://notenest-t4il.onrender.com'

// ─── Storage helpers ───────────────────────────────────────────────────────────
const Storage = {
  get: (key) => new Promise((res) => chrome.storage.local.get([key], (r) => res(r[key]))),
  set: (key, val) => new Promise((res) => chrome.storage.local.set({ [key]: val }, res)),
  remove: (key) => new Promise((res) => chrome.storage.local.remove([key], res)),
}

// ─── API helpers ───────────────────────────────────────────────────────────────
async function apiCall(path, options = {}) {
  const token = await Storage.get('token')
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

// ─── State ─────────────────────────────────────────────────────────────────────
let currentUser = null
let allNotes = []
let allFolders = []
let selectedPageText = ''
let currentTheme = 'light'
let activeTab = 'save'

// ─── DOM refs ──────────────────────────────────────────────────────────────────
const authScreen = document.getElementById('auth-screen')
const mainScreen = document.getElementById('main-screen')
const statusBar = document.getElementById('status-bar')

// ─── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  // Load saved theme
  currentTheme = (await Storage.get('theme')) || 'light'
  applyTheme(currentTheme)

  // Check if logged in
  const token = await Storage.get('token')
  const user = await Storage.get('user')

  if (token && user) {
    currentUser = user
    showMainScreen()
    await loadData()
    // Get selected text from current tab
    getSelectedText()
  } else {
    showAuthScreen()
  }
}

// ─── Theme ─────────────────────────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  const icon = document.getElementById('theme-icon')
  if (theme === 'dark') {
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
  } else {
    icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
  }
}

document.getElementById('theme-toggle-btn').addEventListener('click', async () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark'
  applyTheme(currentTheme)
  await Storage.set('theme', currentTheme)
})

// ─── Screen management ─────────────────────────────────────────────────────────
function showAuthScreen() {
  authScreen.classList.remove('hidden')
  mainScreen.classList.add('hidden')
  statusBar.classList.add('hidden')
}

function showMainScreen() {
  authScreen.classList.add('hidden')
  mainScreen.classList.remove('hidden')
  statusBar.classList.remove('hidden')
  document.getElementById('user-greeting').textContent =
    `Hi, ${currentUser?.username || 'User'} 👋`
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('auth-email').value.trim()
  const password = document.getElementById('auth-password').value

  // Clear errors
  document.getElementById('email-error').textContent = ''
  document.getElementById('password-error').textContent = ''

  // Validate
  if (!email) { document.getElementById('email-error').textContent = 'Email is required'; return }
  if (!password) { document.getElementById('password-error').textContent = 'Password is required'; return }

  setLoading('login', true)
  try {
    const res = await apiCall('https://notenest-t4il.onrender.com', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    await Storage.set('token', res.data.token)
    await Storage.set('user', res.data)
    currentUser = res.data
    showMainScreen()
    await loadData()
    getSelectedText()
  } catch (err) {
    document.getElementById('password-error').textContent = err.message || 'Invalid email or password'
  } finally {
    setLoading('login', false)
  }
})

document.getElementById('open-register').addEventListener('click', (e) => {
  e.preventDefault()
  chrome.tabs.create({ url: 'https://note-nest-omega-five.vercel.app' })
})

document.getElementById('logout-btn').addEventListener('click', async () => {
  await Storage.remove('token')
  await Storage.remove('user')
  currentUser = null
  allNotes = []
  allFolders = []
  showAuthScreen()
})

// ─── Load data ─────────────────────────────────────────────────────────────────
async function loadData() {
  try {
    const [notesRes, foldersRes] = await Promise.all([
      apiCall('/notes'),
      apiCall('/folders'),
    ])
    allNotes = notesRes.data || []
    allFolders = foldersRes.data || []
    populateFolderSelect()
    renderNotes(allNotes)
  } catch (err) {
    console.error('Failed to load data:', err)
  }
}

function populateFolderSelect() {
  const select = document.getElementById('folder-select')
  select.innerHTML = '<option value="">No folder</option>'
  allFolders.forEach((f) => {
    const opt = document.createElement('option')
    opt.value = f._id
    opt.textContent = f.name
    select.appendChild(opt)
  })
}

// ─── Get selected text from page ──────────────────────────────────────────────
function getSelectedText() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) return
    chrome.scripting.executeScript(
      { target: { tabId: tabs[0].id }, func: () => window.getSelection()?.toString() || '' },
      (results) => {
        const text = results?.[0]?.result || ''
        if (text.trim()) {
          selectedPageText = text.trim()
          // Show in Save tab
          document.getElementById('selected-text-section').style.display = 'block'
          document.getElementById('selected-text-preview').textContent =
            text.length > 200 ? text.slice(0, 200) + '...' : text
          // Pre-fill content
          document.getElementById('note-content').value = text
          // Pre-fill AI tab
          document.getElementById('ai-text-input').value = text
        }
      }
    )
  })
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab
    activeTab = tab

    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'))
    document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'))

    btn.classList.add('active')
    document.getElementById(`tab-${tab}`).classList.add('active')

    if (tab === 'notes') renderNotes(allNotes)
  })
})

// ─── Save Note ─────────────────────────────────────────────────────────────────
document.getElementById('save-note-btn').addEventListener('click', async () => {
  const title = document.getElementById('note-title').value.trim()
  const content = document.getElementById('note-content').value.trim()
  const folderId = document.getElementById('folder-select').value

  if (!title) {
    document.getElementById('note-title').style.borderColor = 'var(--destructive)'
    document.getElementById('note-title').focus()
    return
  }
  document.getElementById('note-title').style.borderColor = ''

  setLoading('save', true)
  try {
    const res = await apiCall('/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content, folderId: folderId || null }),
    })
    allNotes.unshift(res.data)

    // Show success
    document.getElementById('save-success').style.display = 'block'
    document.getElementById('note-title').value = ''
    document.getElementById('note-content').value = ''
    document.getElementById('folder-select').value = ''

    setTimeout(() => {
      document.getElementById('save-success').style.display = 'none'
    }, 2500)
  } catch (err) {
    alert('Failed to save note: ' + err.message)
  } finally {
    setLoading('save', false)
  }
})

// ─── AI Tools ──────────────────────────────────────────────────────────────────
async function runAI(action) {
  const text = document.getElementById('ai-text-input').value.trim()
  if (!text) {
    document.getElementById('ai-text-input').focus()
    return
  }

  // Save text as a temp note to use the AI endpoint
  let noteId = null
  try {
    const noteRes = await apiCall('/notes', {
      method: 'POST',
      body: JSON.stringify({ title: `[AI Temp] ${text.slice(0, 30)}`, content: text }),
    })
    noteId = noteRes.data._id
  } catch (err) {
    alert('Error: ' + err.message)
    return
  }

  document.getElementById('ai-response-section').style.display = 'none'
  document.getElementById(`ai-${action}-btn`).innerHTML = '<span class="spinner" style="border-color: var(--muted-foreground); border-top-color: transparent;"></span> Processing...'

  try {
    let res
    if (action === 'summarize') {
      res = await apiCall(`/ai/summarize/${noteId}`, { method: 'POST' })
      showAIResult(res.data.summary)
    } else if (action === 'explain') {
      res = await apiCall(`/ai/explain/${noteId}`, { method: 'POST' })
      showAIResult(res.data.explanation)
    }
  } catch (err) {
    alert('AI Error: ' + err.message)
  } finally {
    // Restore button text
    if (action === 'summarize') {
      document.getElementById('ai-summarize-btn').innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg> Summarize Text`
    } else {
      document.getElementById('ai-explain-btn').innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg> Explain Text`
    }
    // Delete temp note
    if (noteId) {
      try { await apiCall(`/notes/${noteId}`, { method: 'DELETE' }) } catch {}
    }
  }
}

function showAIResult(text) {
  document.getElementById('ai-response-section').style.display = 'block'
  document.getElementById('ai-response-text').textContent = text
}

document.getElementById('ai-summarize-btn').addEventListener('click', () => runAI('summarize'))
document.getElementById('ai-explain-btn').addEventListener('click', () => runAI('explain'))

document.getElementById('ai-ask-btn').addEventListener('click', async () => {
  const text = document.getElementById('ai-text-input').value.trim()
  const question = document.getElementById('ai-question').value.trim()
  if (!text || !question) return

  document.getElementById('ai-ask-btn').innerHTML = '<span class="spinner" style="border-color: var(--primary-foreground); border-top-color: transparent;"></span>'

  // Create temp note and ask
  let noteId = null
  try {
    const noteRes = await apiCall('/notes', {
      method: 'POST',
      body: JSON.stringify({ title: `[AI Q] ${text.slice(0, 20)}`, content: text }),
    })
    noteId = noteRes.data._id
    const res = await apiCall(`/ai/ask/${noteId}`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    })
    showAIResult(res.data.answer)
    document.getElementById('ai-question').value = ''
  } catch (err) {
    alert('AI Error: ' + err.message)
  } finally {
    document.getElementById('ai-ask-btn').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'
    if (noteId) {
      try { await apiCall(`/notes/${noteId}`, { method: 'DELETE' }) } catch {}
    }
  }
})

// Save AI result as note
document.getElementById('save-ai-result-btn').addEventListener('click', async () => {
  const aiText = document.getElementById('ai-response-text').textContent
  const originalText = document.getElementById('ai-text-input').value.slice(0, 30)
  if (!aiText) return

  try {
    await apiCall('/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: `AI Summary of: ${originalText}...`,
        content: aiText,
      }),
    })
    document.getElementById('save-ai-result-btn').textContent = '✅ Saved!'
    setTimeout(() => {
      document.getElementById('save-ai-result-btn').textContent = 'Save AI Result as Note'
    }, 2000)
    await loadData()
  } catch (err) {
    alert('Failed to save: ' + err.message)
  }
})

// ─── Notes list ────────────────────────────────────────────────────────────────
function renderNotes(notes) {
  const list = document.getElementById('notes-list')
  const empty = document.getElementById('notes-empty')

  list.innerHTML = ''

  if (!notes || notes.length === 0) {
    empty.style.display = 'flex'
    return
  }

  empty.style.display = 'none'

  notes.forEach((note) => {
    const item = document.createElement('div')
    item.className = 'note-item'
    item.innerHTML = `
      <div class="note-item-title">${escapeHtml(note.title)}</div>
      <div class="note-item-preview">${escapeHtml(note.content || 'No content')}</div>
      <div class="note-item-date">${formatDate(note.updatedAt)}</div>
    `
    item.addEventListener('click', () => {
      chrome.tabs.create({ url: `https://note-nest-omega-five.vercel.app/${note._id}` })
    })
    list.appendChild(item)
  })
}

// Search notes
document.getElementById('notes-search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase()
  if (!q) { renderNotes(allNotes); return }
  const filtered = allNotes.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      (n.content || '').toLowerCase().includes(q)
  )
  renderNotes(filtered)
})

// ─── Open website ──────────────────────────────────────────────────────────────
document.getElementById('open-website-link').addEventListener('click', (e) => {
  e.preventDefault()
  chrome.tabs.create({ url: 'https://note-nest-omega-five.vercel.app' })
})

// ─── Loading states ────────────────────────────────────────────────────────────
function setLoading(action, isLoading) {
  if (action === 'login') {
    document.getElementById('login-text').style.display = isLoading ? 'none' : 'inline'
    document.getElementById('login-spinner').style.display = isLoading ? 'inline-block' : 'none'
    document.getElementById('login-btn').disabled = isLoading
  } else if (action === 'save') {
    document.getElementById('save-text').style.display = isLoading ? 'none' : 'inline'
    document.getElementById('save-spinner').style.display = isLoading ? 'inline-block' : 'none'
    document.getElementById('save-note-btn').disabled = isLoading
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr))
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ─── Boot ──────────────────────────────────────────────────────────────────────
init()