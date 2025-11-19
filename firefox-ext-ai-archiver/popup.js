// Popup script for the AI Archiver extension
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup loaded');

  // Load and display stats
  await loadStats();

  // Set up event listeners
  document.getElementById('archive-current').addEventListener('click', archiveCurrentConversation);
  document.getElementById('view-conversations').addEventListener('click', toggleConversationsList);
  document.getElementById('export-db').addEventListener('click', exportDatabase);
});

async function loadStats() {
  try {
    const response = await browser.runtime.sendMessage({ action: 'getStats' });

    if (response.success) {
      document.getElementById('conversation-count').textContent = response.stats.conversations;
      document.getElementById('message-count').textContent = response.stats.messages;
      document.getElementById('artifact-count').textContent = response.stats.artifacts;
    }
  } catch (error) {
    console.error('Error loading stats:', error);
    showStatus('Error loading statistics', 'error');
  }
}

async function archiveCurrentConversation() {
  showStatus('Archiving conversation...', 'info');

  try {
    // Get current tab
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];

    // Check if we're on a supported AI platform
    const isClaude = currentTab.url.includes('claude.ai');
    const isGemini = currentTab.url.includes('gemini.google.com');

    if (!isClaude && !isGemini) {
      showStatus('Please navigate to Claude.ai or Gemini first', 'error');
      return;
    }

    // Extract conversation from the page
    const response = await browser.tabs.sendMessage(currentTab.id, {
      action: 'extractConversation'
    });

    if (!response.success) {
      throw new Error('Failed to extract conversation data');
    }

    // Add title from page
    response.data.title = currentTab.title || 'Untitled Conversation';

    // Save to database
    const saveResponse = await browser.runtime.sendMessage({
      action: 'saveConversation',
      data: response.data
    });

    if (saveResponse.success) {
      showStatus(
        `Conversation archived! (${saveResponse.result.messageCount} messages)`,
        'success'
      );
      await loadStats(); // Refresh stats
    } else {
      throw new Error(saveResponse.error);
    }
  } catch (error) {
    console.error('Error archiving conversation:', error);
    showStatus('Error: ' + error.message, 'error');
  }
}

async function toggleConversationsList() {
  const listElement = document.getElementById('conversations-list');
  const containerElement = document.getElementById('conversations-container');

  if (listElement.style.display === 'none') {
    // Load and show conversations
    showStatus('Loading conversations...', 'info');

    try {
      const response = await browser.runtime.sendMessage({
        action: 'getConversations',
        filters: { limit: 20 }
      });

      if (response.success) {
        displayConversations(response.conversations);
        listElement.style.display = 'block';
        showStatus('', ''); // Clear status
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      showStatus('Error loading conversations', 'error');
    }
  } else {
    // Hide conversations list
    listElement.style.display = 'none';
  }
}

function displayConversations(conversations) {
  const container = document.getElementById('conversations-container');
  container.innerHTML = '';

  if (conversations.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No conversations archived yet</p>';
    return;
  }

  conversations.forEach(conv => {
    const item = document.createElement('div');
    item.className = 'conversation-item';
    item.onclick = () => openConversation(conv.conversation_id);

    const title = document.createElement('div');
    title.className = 'conversation-title';
    title.textContent = conv.title || 'Untitled Conversation';

    const meta = document.createElement('div');
    meta.className = 'conversation-meta';

    const date = document.createElement('span');
    date.className = 'conversation-date';
    date.textContent = formatDate(conv.updated_at);

    const platform = document.createElement('span');
    platform.className = 'conversation-platform';
    platform.textContent = (conv.platform || 'claude').toUpperCase();
    platform.style.fontWeight = 'bold';
    platform.style.color = conv.platform === 'gemini' ? '#4285f4' : '#764ba2';

    meta.appendChild(date);
    meta.appendChild(platform);

    item.appendChild(title);
    item.appendChild(meta);

    container.appendChild(item);
  });
}

async function openConversation(conversationId) {
  try {
    const response = await browser.runtime.sendMessage({
      action: 'getConversation',
      conversationId: conversationId
    });

    if (response.success) {
      // Open conversation in a new tab or display in popup
      const url = response.conversation.url;
      if (url) {
        browser.tabs.create({ url: url });
      } else {
        showStatus('Conversation URL not available', 'error');
      }
    }
  } catch (error) {
    console.error('Error opening conversation:', error);
    showStatus('Error opening conversation', 'error');
  }
}

async function exportDatabase() {
  showStatus('Exporting database...', 'info');

  try {
    const response = await browser.runtime.sendMessage({
      action: 'exportDatabase'
    });

    if (response.success) {
      showStatus('Database exported successfully!', 'success');
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('Error exporting database:', error);
    showStatus('Error: ' + error.message, 'error');
  }
}

function showStatus(message, type) {
  const statusElement = document.getElementById('status-message');
  statusElement.textContent = message;
  statusElement.className = 'status-message';

  if (type) {
    statusElement.classList.add(type);
  }

  if (message) {
    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 5000);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
