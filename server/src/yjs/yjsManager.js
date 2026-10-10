const Y = require('yjs');
const syncProtocol = require('y-protocols/dist/sync.cjs');
const DocumentState = require('../models/DocumentState');
const { getDBStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');

class YjsManager {
  constructor() {
    this.docs = new Map(); // key -> Y.Doc
    this.saveTimeouts = new Map();
  }

  // Get or initialize a Y.Doc for a room/file
  async getOrCreateDoc(docKey, initialContent = '', fileName = 'index.js', language = 'javascript') {
    if (this.docs.has(docKey)) {
      return this.docs.get(docKey);
    }

    const ydoc = new Y.Doc();
    const [roomId, fileId = 'main'] = docKey.split(':');

    // Attempt to load persisted state from MongoDB or memoryStore
    let loaded = false;
    try {
      if (getDBStatus()) {
        const persisted = await DocumentState.findOne({ roomId, fileId });
        if (persisted && persisted.encodedState) {
          const update = Buffer.from(persisted.encodedState, 'base64');
          Y.applyUpdate(ydoc, new Uint8Array(update));
          loaded = true;
        } else if (persisted && persisted.textSnapshot) {
          const ytext = ydoc.getText('monaco');
          ytext.insert(0, persisted.textSnapshot);
          loaded = true;
        }
      } else {
        const memDoc = memoryStore.documents.get(docKey);
        if (memDoc && memDoc.encodedState) {
          const update = Buffer.from(memDoc.encodedState, 'base64');
          Y.applyUpdate(ydoc, new Uint8Array(update));
          loaded = true;
        } else if (memDoc && memDoc.textSnapshot) {
          const ytext = ydoc.getText('monaco');
          ytext.insert(0, memDoc.textSnapshot);
          loaded = true;
        }
      }
    } catch (err) {
      console.error(`[YjsManager] Error loading persisted doc for ${docKey}:`, err.message);
    }

    // If doc was fresh with no persisted data, insert initial text
    if (!loaded && initialContent) {
      const ytext = ydoc.getText('monaco');
      ytext.insert(0, initialContent);
    }

    // Attach update listener to trigger auto-persistence debounced
    ydoc.on('update', (update) => {
      this.scheduleSave(docKey, fileName, language);
    });

    this.docs.set(docKey, ydoc);
    return ydoc;
  }

  getDoc(docKey) {
    return this.docs.get(docKey);
  }

  // Schedule auto-save 2 seconds after last edit
  scheduleSave(docKey, fileName, language) {
    if (this.saveTimeouts.has(docKey)) {
      clearTimeout(this.saveTimeouts.get(docKey));
    }

    const timeout = setTimeout(async () => {
      this.saveTimeouts.delete(docKey);
      await this.persistDoc(docKey, null, fileName, language);
    }, 2000);

    this.saveTimeouts.set(docKey, timeout);
  }

  // Persist current Y.Doc state into MongoDB / MemoryStore
  async persistDoc(docKey, directText = null, fileName = 'index.js', language = 'javascript') {
    const ydoc = this.docs.get(docKey);
    const [roomId, fileId = 'main'] = docKey.split(':');

    let encodedState = '';
    let textSnapshot = directText;

    if (ydoc) {
      const stateUpdate = Y.encodeStateAsUpdate(ydoc);
      encodedState = Buffer.from(stateUpdate).toString('base64');
      if (textSnapshot === null) {
        textSnapshot = ydoc.getText('monaco').toString();
      }
    } else if (textSnapshot === null) {
      return;
    }

    try {
      if (getDBStatus()) {
        await DocumentState.findOneAndUpdate(
          { roomId, fileId },
          {
            roomId,
            fileId,
            fileName,
            language,
            encodedState,
            textSnapshot: textSnapshot || '',
            $inc: { version: 1 },
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );
      } else {
        const existing = memoryStore.documents.get(docKey) || {};
        memoryStore.documents.set(docKey, {
          ...existing,
          roomId,
          fileId,
          fileName,
          language,
          encodedState,
          textSnapshot: textSnapshot || '',
          version: (existing.version || 0) + 1,
          updatedAt: new Date(),
        });
      }
      console.log(`[YjsManager] Persisted document ${docKey} (length: ${(textSnapshot || '').length} chars)`);
    } catch (err) {
      console.error(`[YjsManager] Error saving document ${docKey}:`, err.message);
    }
  }

  // Remove doc from memory if no clients attached
  destroyDocIfEmpty(docKey) {
    // Keep doc in memory or flush save
    if (this.saveTimeouts.has(docKey)) {
      clearTimeout(this.saveTimeouts.get(docKey));
      this.persistDoc(docKey);
    }
  }
}

module.exports = new YjsManager();
