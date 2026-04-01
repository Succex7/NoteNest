// extension/content.js — Runs on every webpage
// Captures selected text and sends to background

document.addEventListener('mouseup', () => {
  const selected = window.getSelection()?.toString()?.trim()
  if (selected && selected.length > 0) {
    chrome.runtime.sendMessage({
      type: 'SELECTED_TEXT',
      text: selected,
    })
  }
})