// extension/background.js — Service worker

// Open side panel when extension icon is clicked (optional side panel mode)
chrome.action.onClicked.addListener((tab) => {
  // This only fires if default_popup is NOT set
  // Since we use popup, this is a fallback
})

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SELECTED_TEXT') {
    // Store selected text so popup can access it
    chrome.storage.local.set({ lastSelectedText: message.text })
    sendResponse({ success: true })
  }
})