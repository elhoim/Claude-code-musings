// Content script for extracting Gemini conversations
(function() {
  'use strict';

  console.log('AI Archiver: Gemini content script loaded');

  // Extract conversation data from the DOM
  function extractConversationData() {
    const conversationData = {
      platform: 'gemini',
      url: window.location.href,
      timestamp: new Date().toISOString(),
      conversationId: extractConversationId(),
      messages: [],
      artifacts: []
    };

    // Extract conversation ID from URL
    function extractConversationId() {
      // Gemini URLs are like: https://gemini.google.com/app/CONVERSATION_ID
      const match = window.location.pathname.match(/\/app\/([^\/]+)/);
      if (match) return match[1];

      // Generate a unique ID based on timestamp if not in URL
      return `gemini-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Find all message elements - Gemini uses different selectors
    // Gemini's structure: message-content, user-query, model-response
    const messageContainers = document.querySelectorAll('[data-test-id*="conversation-turn"], .conversation-turn, message-content');

    // Try alternative selectors if the above doesn't work
    let allMessages = Array.from(messageContainers);

    if (allMessages.length === 0) {
      // Try finding by class patterns
      const userMessages = document.querySelectorAll('[class*="user"], [class*="query"]');
      const assistantMessages = document.querySelectorAll('[class*="model"], [class*="response"]');

      // Combine and sort by position in DOM
      allMessages = [...userMessages, ...assistantMessages].sort((a, b) => {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });
    }

    // Extract messages
    allMessages.forEach((element, index) => {
      // Determine if it's a user or assistant message
      const elementText = element.className.toLowerCase() + ' ' + (element.getAttribute('data-test-id') || '');
      const isUser = elementText.includes('user') || elementText.includes('query');

      // Get message content
      let content = '';
      let html = '';

      // Try to find the actual text content within the element
      const textElement = element.querySelector('[class*="text"], [class*="content"], .markdown-content') || element;
      content = textElement.innerText || textElement.textContent || '';
      html = element.innerHTML;

      if (content.trim()) {
        const messageData = {
          index: index,
          role: isUser ? 'user' : 'assistant',
          content: content,
          html: html,
          timestamp: new Date().toISOString()
        };

        conversationData.messages.push(messageData);
      }
    });

    // Extract artifacts (code blocks, etc.)
    // Gemini uses different code block styling
    const codeBlocks = document.querySelectorAll('pre code, .code-block, [class*="code-container"]');

    codeBlocks.forEach((element, index) => {
      const artifactData = {
        index: index,
        type: 'code',
        content: element.textContent,
        html: element.outerHTML,
        language: detectLanguage(element)
      };

      conversationData.artifacts.push(artifactData);
    });

    // Extract images and other media
    const images = document.querySelectorAll('img[src*="googleusercontent"], img[alt]');
    images.forEach((img, index) => {
      if (img.src && !img.src.includes('icon') && !img.src.includes('logo')) {
        conversationData.artifacts.push({
          index: codeBlocks.length + index,
          type: 'image',
          content: img.alt || img.src,
          html: img.outerHTML,
          language: 'image',
          url: img.src
        });
      }
    });

    return conversationData;
  }

  function detectLanguage(element) {
    // Try to detect language from class names
    const className = element.className || '';

    // Common language class patterns
    const langMatch = className.match(/language-(\w+)/i) ||
                     className.match(/lang-(\w+)/i) ||
                     className.match(/\b(python|javascript|java|cpp|csharp|ruby|go|rust|typescript|html|css|sql|bash|shell)\b/i);

    if (langMatch) return langMatch[1].toLowerCase();

    // Try to detect from parent element
    const parent = element.parentElement;
    if (parent) {
      const parentClass = parent.className || '';
      const parentLangMatch = parentClass.match(/language-(\w+)/i);
      if (parentLangMatch) return parentLangMatch[1].toLowerCase();
    }

    return 'unknown';
  }

  function detectArtifactType(element) {
    if (element.tagName === 'CODE' || element.classList.contains('code-block')) return 'code';
    if (element.tagName === 'IMG') return 'image';
    if (element.querySelector('svg')) return 'svg';
    return 'text';
  }

  // Listen for messages from popup or background script
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'extractConversation') {
      console.log('AI Archiver: Extracting Gemini conversation...');
      const data = extractConversationData();
      sendResponse({ success: true, data: data });
    } else if (message.action === 'getPageInfo') {
      sendResponse({
        platform: 'gemini',
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
      console.log('AI Archiver: Gemini page loaded, ready to extract');
    } else {
      window.addEventListener('load', () => {
        console.log('AI Archiver: Gemini page loaded, ready to extract');
      });
    }
  }

  function extractConversationId() {
    const match = window.location.pathname.match(/\/app\/([^\/]+)/);
    if (match) return match[1];
    return `gemini-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  autoExtract();
})();
