// Background script for handling database operations
import Database from './database.js';

console.log('Claude Archiver: Background script loaded');

const db = new Database();

// Initialize database on extension load
db.init().catch(err => {
  console.error('Failed to initialize database:', err);
});

// Listen for messages from content script or popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message.action);

  if (message.action === 'saveConversation') {
    handleSaveConversation(message.data)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (message.action === 'getConversations') {
    handleGetConversations(message.filters)
      .then(conversations => sendResponse({ success: true, conversations }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.action === 'getConversation') {
    handleGetConversation(message.conversationId)
      .then(conversation => sendResponse({ success: true, conversation }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.action === 'exportDatabase') {
    handleExportDatabase()
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.action === 'getStats') {
    handleGetStats()
      .then(stats => sendResponse({ success: true, stats }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function handleSaveConversation(conversationData) {
  console.log('Saving conversation:', conversationData.conversationId);

  // Save conversation metadata
  const conversationId = await db.saveConversation({
    conversation_id: conversationData.conversationId,
    url: conversationData.url,
    title: conversationData.title || 'Untitled Conversation',
    created_at: conversationData.timestamp,
    updated_at: conversationData.timestamp
  });

  // Save messages
  for (const message of conversationData.messages) {
    await db.saveMessage({
      conversation_id: conversationData.conversationId,
      message_index: message.index,
      role: message.role,
      content: message.content,
      html_content: message.html,
      created_at: message.timestamp || conversationData.timestamp
    });
  }

  // Save artifacts
  for (const artifact of conversationData.artifacts) {
    await db.saveArtifact({
      conversation_id: conversationData.conversationId,
      artifact_index: artifact.index,
      type: artifact.type,
      language: artifact.language,
      content: artifact.content,
      html_content: artifact.html,
      created_at: conversationData.timestamp
    });
  }

  console.log('Conversation saved successfully');
  return { conversationId, messageCount: conversationData.messages.length };
}

async function handleGetConversations(filters = {}) {
  return await db.getConversations(filters);
}

async function handleGetConversation(conversationId) {
  return await db.getConversation(conversationId);
}

async function handleExportDatabase() {
  const data = await db.exportDatabase();
  const blob = new Blob([data], { type: 'application/x-sqlite3' });
  const url = URL.createObjectURL(blob);

  const downloadId = await browser.downloads.download({
    url: url,
    filename: `claude-conversations-${new Date().toISOString().split('T')[0]}.db`,
    saveAs: true
  });

  return { downloadId };
}

async function handleGetStats() {
  return await db.getStats();
}

// Context menu for quick archiving
browser.contextMenus.create({
  id: 'archive-conversation',
  title: 'Archive this Claude conversation',
  contexts: ['page'],
  documentUrlPatterns: ['https://claude.ai/*']
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'archive-conversation') {
    browser.tabs.sendMessage(tab.id, { action: 'extractConversation' })
      .then(response => {
        if (response.success) {
          return handleSaveConversation(response.data);
        }
      })
      .then(() => {
        browser.notifications.create({
          type: 'basic',
          title: 'Claude Archiver',
          message: 'Conversation archived successfully!'
        });
      })
      .catch(err => {
        console.error('Error archiving conversation:', err);
        browser.notifications.create({
          type: 'basic',
          title: 'Claude Archiver Error',
          message: 'Failed to archive conversation: ' + err.message
        });
      });
  }
});
