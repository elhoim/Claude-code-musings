// Database handler using IndexedDB (SQLite-like structure)
// Note: Browser extensions can't use native SQLite, so we use IndexedDB
// with a SQL-like schema for compatibility

class Database {
  constructor() {
    this.dbName = 'ClaudeConversationsDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create conversations table
        if (!db.objectStoreNames.contains('conversations')) {
          const conversationStore = db.createObjectStore('conversations', {
            keyPath: 'id',
            autoIncrement: true
          });
          conversationStore.createIndex('conversation_id', 'conversation_id', { unique: true });
          conversationStore.createIndex('created_at', 'created_at', { unique: false });
          conversationStore.createIndex('updated_at', 'updated_at', { unique: false });
        }

        // Create messages table
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', {
            keyPath: 'id',
            autoIncrement: true
          });
          messageStore.createIndex('conversation_id', 'conversation_id', { unique: false });
          messageStore.createIndex('message_index', 'message_index', { unique: false });
          messageStore.createIndex('role', 'role', { unique: false });
          messageStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Create artifacts table
        if (!db.objectStoreNames.contains('artifacts')) {
          const artifactStore = db.createObjectStore('artifacts', {
            keyPath: 'id',
            autoIncrement: true
          });
          artifactStore.createIndex('conversation_id', 'conversation_id', { unique: false });
          artifactStore.createIndex('type', 'type', { unique: false });
          artifactStore.createIndex('language', 'language', { unique: false });
        }

        console.log('Database schema created');
      };
    });
  }

  async saveConversation(conversation) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['conversations'], 'readwrite');
      const store = transaction.objectStore('conversations');
      const index = store.index('conversation_id');

      // Check if conversation already exists
      const getRequest = index.get(conversation.conversation_id);

      getRequest.onsuccess = () => {
        const existingConversation = getRequest.result;

        if (existingConversation) {
          // Update existing conversation
          conversation.id = existingConversation.id;
          conversation.updated_at = new Date().toISOString();
          const updateRequest = store.put(conversation);

          updateRequest.onsuccess = () => resolve(conversation.id);
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          // Insert new conversation
          const addRequest = store.add(conversation);

          addRequest.onsuccess = () => resolve(addRequest.result);
          addRequest.onerror = () => reject(addRequest.error);
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async saveMessage(message) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['messages'], 'readwrite');
      const store = transaction.objectStore('messages');

      const request = store.add(message);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveArtifact(artifact) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['artifacts'], 'readwrite');
      const store = transaction.objectStore('artifacts');

      const request = store.add(artifact);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getConversations(filters = {}) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['conversations'], 'readonly');
      const store = transaction.objectStore('conversations');
      const request = store.getAll();

      request.onsuccess = () => {
        let conversations = request.result;

        // Apply filters
        if (filters.limit) {
          conversations = conversations.slice(0, filters.limit);
        }

        // Sort by updated_at descending
        conversations.sort((a, b) =>
          new Date(b.updated_at) - new Date(a.updated_at)
        );

        resolve(conversations);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getConversation(conversationId) {
    if (!this.db) await this.init();

    const conversation = await new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['conversations'], 'readonly');
      const store = transaction.objectStore('conversations');
      const index = store.index('conversation_id');
      const request = index.get(conversationId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get messages
    const messages = await new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['messages'], 'readonly');
      const store = transaction.objectStore('messages');
      const index = store.index('conversation_id');
      const request = index.getAll(conversationId);

      request.onsuccess = () => {
        const messages = request.result;
        messages.sort((a, b) => a.message_index - b.message_index);
        resolve(messages);
      };
      request.onerror = () => reject(request.error);
    });

    // Get artifacts
    const artifacts = await new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['artifacts'], 'readonly');
      const store = transaction.objectStore('artifacts');
      const index = store.index('conversation_id');
      const request = index.getAll(conversationId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return {
      ...conversation,
      messages,
      artifacts
    };
  }

  async getStats() {
    if (!this.db) await this.init();

    const conversationCount = await new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['conversations'], 'readonly');
      const store = transaction.objectStore('conversations');
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const messageCount = await new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['messages'], 'readonly');
      const store = transaction.objectStore('messages');
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const artifactCount = await new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['artifacts'], 'readonly');
      const store = transaction.objectStore('artifacts');
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return {
      conversations: conversationCount,
      messages: messageCount,
      artifacts: artifactCount
    };
  }

  async exportDatabase() {
    if (!this.db) await this.init();

    // Export all data as JSON (SQLite export would require sql.js)
    const conversations = await this.getConversations();
    const exportData = {
      version: this.version,
      exported_at: new Date().toISOString(),
      conversations: []
    };

    for (const conv of conversations) {
      const fullConversation = await this.getConversation(conv.conversation_id);
      exportData.conversations.push(fullConversation);
    }

    return JSON.stringify(exportData, null, 2);
  }
}

export default Database;
