import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const DEFAULT_RENDER_BACKEND = 'https://collaborative-code-editor-kf4f.onrender.com';
    let SOCKET_URL = window.location.origin;

    if (import.meta.env.VITE_BACKEND_URL) {
      SOCKET_URL = import.meta.env.VITE_BACKEND_URL;
    } else if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      SOCKET_URL = DEFAULT_RENDER_BACKEND;
    }

    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    if (typeof socket.setMaxListeners === 'function') {
      socket.setMaxListeners(50);
    }

    socket.on('connect', () => {
      console.log('[Socket] Connected with ID:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection Error:', error.message);
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};
