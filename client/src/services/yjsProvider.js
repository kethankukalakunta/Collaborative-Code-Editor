import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { getSocket } from './socket';

export class SocketIOYjsProvider {
  constructor(roomId, fileId, ydoc, awareness = null) {
    this.roomId = roomId;
    this.fileId = fileId;
    this.docKey = `${roomId}:${fileId}`;
    this.ydoc = ydoc;
    this.awareness = awareness;
    this.socket = getSocket();
    this.synced = false;
    this._listeners = new Set();

    this.init();
  }

  init() {
    if (!this.socket.connected) {
      this.socket.connect();
    }

    // Handle local Yjs document changes -> transmit to peers
    this._updateHandler = (update, origin) => {
      // Don't echo updates that originated from the socket
      if (origin !== 'remote') {
        const base64Update = this.uint8ArrayToBase64(update);
        this.socket.emit('yjs:update', {
          docKey: this.docKey,
          update: base64Update,
        });
      }
    };
    this.ydoc.on('update', this._updateHandler);

    // Handle incoming initial sync from server
    this._initialSyncHandler = (data) => {
      if (data.docKey === this.docKey && data.update) {
        try {
          const updateArray = this.base64ToUint8Array(data.update);
          Y.applyUpdate(this.ydoc, updateArray, 'remote');
          this.synced = true;
          this.emit('synced', true);
        } catch (err) {
          console.error('[YjsProvider] Initial sync error:', err);
        }
      }
    };
    this.socket.on('yjs:sync-initial', this._initialSyncHandler);

    // Handle remote incremental updates
    this._remoteUpdateHandler = (data) => {
      if (data.docKey === this.docKey && data.update) {
        try {
          const updateArray = this.base64ToUint8Array(data.update);
          Y.applyUpdate(this.ydoc, updateArray, 'remote');
        } catch (err) {
          console.error('[YjsProvider] Remote update error:', err);
        }
      }
    };
    this.socket.on('yjs:update', this._remoteUpdateHandler);
  }

  uint8ArrayToBase64(bytes) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  base64ToUint8Array(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  on(event, callback) {
    this._listeners.add({ event, callback });
  }

  emit(event, data) {
    this._listeners.forEach((listener) => {
      if (listener.event === event) {
        listener.callback(data);
      }
    });
  }

  destroy() {
    this.ydoc.off('update', this._updateHandler);
    this.socket.off('yjs:sync-initial', this._initialSyncHandler);
    this.socket.off('yjs:update', this._remoteUpdateHandler);
    this._listeners.clear();
  }
}
