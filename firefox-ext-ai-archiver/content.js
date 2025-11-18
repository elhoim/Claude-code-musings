// Content script for extracting Claude.ai conversations
(function() {
  'use strict';

  console.log('Claude Archiver: Content script loaded');

  // Extract conversation data from the DOM
  function extractConversationData() {
    const conversationData = {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      conversationId: extractConversationId(),
      messages: [],
      artifacts: []
    };

    // Extract conversation ID from URL
    function extractConversationId() {
      const match = window.location.pathname.match(/\/chat\/([^\/]+)/);
      return match ? match[1] : null;
    }

    // Find all message elements
    const messageElements = document.querySelectorAll('[data-testid="user-message"], [data-testid="assistant-message"]');

    if (messageElements.length === 0) {
      // Try alternative selectors
      const altMessages = document.querySelectorAll('.font-user-message, .font-claude-message');
      messageElements.push(...altMessages);
    }

    // Extract messages
    messageElements.forEach((element, index) => {
      const isUser = element.getAttribute('data-testid') === 'user-message' ||
                     element.classList.contains('font-user-message');

      const messageData = {
        index: index,
        role: isUser ? 'user' : 'assistant',
        content: element.innerText || element.textContent,
        html: element.innerHTML,
        timestamp: new Date().toISOString()
      };

      conversationData.messages.push(messageData);
    });

    // Extract artifacts (code blocks, documents, etc.)
    const artifactElements = document.querySelectorAll('[data-component="artifact"], .artifact, pre code');

    artifactElements.forEach((element, index) => {
      const artifactData = {
        index: index,
        type: detectArtifactType(element),
        content: element.textContent,
        html: element.outerHTML,
        language: element.className.match(/language-(\w+)/) ?
                  element.className.match(/language-(\w+)/)[1] : 'unknown'
      };

      conversationData.artifacts.push(artifactData);
    });

    return conversationData;
  }

  function detectArtifactType(element) {
    if (element.tagName === 'CODE') return 'code';
    if (element.querySelector('svg')) return 'svg';
    if (element.querySelector('img')) return 'image';
    return 'text';
  }

  // Listen for messages from popup or background script
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'extractConversation') {
      console.log('Claude Archiver: Extracting conversation...');
      const data = extractConversationData();
      sendResponse({ success: true, data: data });
    } else if (message.action === 'getPageInfo') {
      sendResponse({
        url: window.location.href,
        title: document.title,
        conversationId: extractConversationId()
      });
    }
    return true; // Keep channel open for async response
  });

  // Auto-extract on page load (optional)
  function autoExtract() {
    // Wait for page to fully load
    if (document.readyState === 'complete') {
      console.log('Claude Archiver: Page loaded, ready to extract');
    } else {
      window.addEventListener('load', () => {
        console.log('Claude Archiver: Page loaded, ready to extract');
      });
    }
  }

  function extractConversationId() {
    const match = window.location.pathname.match(/\/chat\/([^\/]+)/);
    return match ? match[1] : null;
  }

  autoExtract();
})();
