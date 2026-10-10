const Y = require('yjs');
const syncProtocol = require('y-protocols/dist/sync.cjs');
const yjsManager = require('../yjs/yjsManager');
const Room = require('../models/Room');
const { getDBStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');

// Map to track active room users: roomId -> Map(socketId -> userData)
const roomUsersMap = new Map();

// Map to track socket membership: socketId -> { roomId, user }
const socketMetaMap = new Map();

const collaboratorColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6',
  '#f97316', '#6366f1', '#84cc16', '#eab308'
];

const setupSocketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Handle user joining a collaborative room
    socket.on('room:join', async (data) => {
      try {
        const { roomId, fileId = 'main', user = {}, fileName = 'index.js', language = 'javascript' } = data;
        if (!roomId) return;

        const docKey = `${roomId}:${fileId}`;
        const roomChannel = `room:${roomId}`;
        const fileChannel = `doc:${docKey}`;

        // Ensure user has valid display properties
        const colorIndex = Math.abs(socket.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % collaboratorColors.length;
        const userData = {
          socketId: socket.id,
          id: user.id || user._id || socket.id,
          username: user.username || `Guest_${socket.id.slice(-4)}`,
          displayName: user.displayName || user.username || `Collaborator ${socket.id.slice(-4)}`,
          color: user.color || collaboratorColors[colorIndex],
          avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${socket.id}`,
          isGuest: user.isGuest ?? true,
          joinedAt: new Date(),
          cursor: null,
          selection: null,
          activeFileId: fileId,
        };

        // Join socket rooms
        socket.join(roomChannel);
        socket.join(fileChannel);

        // Track room users
        if (!roomUsersMap.has(roomId)) {
          roomUsersMap.set(roomId, new Map());
        }
        roomUsersMap.get(roomId).set(socket.id, userData);
        socketMetaMap.set(socket.id, { roomId, fileId, user: userData });

        // Update active users count in DB / memory
        const activeCount = roomUsersMap.get(roomId).size;
        if (getDBStatus()) {
          Room.findOneAndUpdate({ roomId }, { activeUsersCount: activeCount, lastActivity: new Date() }).catch(() => {});
        } else if (memoryStore.rooms.has(roomId)) {
          const r = memoryStore.rooms.get(roomId);
          r.activeUsersCount = activeCount;
          r.updatedAt = new Date();
        }

        // Send existing active room users list to the joining user
        const activeUsersList = Array.from(roomUsersMap.get(roomId).values());
        socket.emit('room:users', { users: activeUsersList, currentUser: userData });

        // Broadcast user joined to other peers
        socket.to(roomChannel).emit('room:user-joined', {
          user: userData,
          users: activeUsersList,
          timestamp: new Date(),
        });

        // Initialize or fetch Yjs Document for this room & file
        const ydoc = await yjsManager.getOrCreateDoc(docKey, '', fileName, language);

        // Step 1: Send current state vector or document content for initial sync
        const stateVector = Y.encodeStateVector(ydoc);
        const stateUpdate = Y.encodeStateAsUpdate(ydoc);

        socket.emit('yjs:sync-initial', {
          docKey,
          roomId,
          fileId,
          update: Buffer.from(stateUpdate).toString('base64'),
          textSnapshot: ydoc.getText('monaco').toString(),
        });

        console.log(`[Socket] User ${userData.displayName} joined room ${roomId} (active: ${activeCount})`);
      } catch (err) {
        console.error('[Socket] room:join error:', err);
        socket.emit('error', { message: 'Failed to join collaboration room' });
      }
    });

    // Handle switching or syncing another file inside the same room
    socket.on('file:switch', async (data) => {
      try {
        const { roomId, fileId, fileName, language } = data;
        const docKey = `${roomId}:${fileId}`;
        const fileChannel = `doc:${docKey}`;

        // Leave previous file channels if necessary
        const meta = socketMetaMap.get(socket.id);
        if (meta) {
          socket.leave(`doc:${meta.roomId}:${meta.fileId}`);
          meta.fileId = fileId;
          if (meta.user) meta.user.activeFileId = fileId;
        }

        socket.join(fileChannel);

        const ydoc = await yjsManager.getOrCreateDoc(docKey, '', fileName, language);
        const stateUpdate = Y.encodeStateAsUpdate(ydoc);

        socket.emit('yjs:sync-initial', {
          docKey,
          roomId,
          fileId,
          update: Buffer.from(stateUpdate).toString('base64'),
          textSnapshot: ydoc.getText('monaco').toString(),
        });

        // Broadcast active file presence change
        if (meta && roomUsersMap.has(roomId)) {
          io.to(`room:${roomId}`).emit('room:users', {
            users: Array.from(roomUsersMap.get(roomId).values()),
          });
        }
      } catch (err) {
        console.error('[Socket] file:switch error:', err);
      }
    });

    // Handle incoming Yjs CRDT Update from client
    socket.on('yjs:update', async (data) => {
      try {
        const { docKey, update: base64Update } = data;
        if (!docKey || !base64Update) return;

        const [roomId, fileId] = docKey.split(':');
        const updateBuffer = Buffer.from(base64Update, 'base64');
        const updateArray = new Uint8Array(updateBuffer);

        const ydoc = await yjsManager.getOrCreateDoc(docKey);
        Y.applyUpdate(ydoc, updateArray, socket.id);

        // Broadcast CRDT update to other clients in this file channel
        socket.to(`doc:${docKey}`).emit('yjs:update', {
          docKey,
          roomId,
          fileId,
          update: base64Update,
        });
      } catch (err) {
        console.error('[Socket] yjs:update error:', err);
      }
    });

    // Handle live cursor & selection position update (Awareness)
    socket.on('presence:cursor', (data) => {
      try {
        const { roomId, fileId, cursor, selection } = data;
        const meta = socketMetaMap.get(socket.id);
        if (!meta) return;

        meta.user.cursor = cursor;
        meta.user.selection = selection;
        meta.user.activeFileId = fileId;

        // Broadcast cursor to collaborators in the room
        socket.to(`room:${roomId}`).emit('presence:cursor', {
          socketId: socket.id,
          user: meta.user,
          fileId,
          cursor,
          selection,
        });
      } catch (err) {
        console.error('[Socket] presence:cursor error:', err);
      }
    });

    // Handle collaborative real-time chat messages
    socket.on('chat:message', (data) => {
      try {
        const { roomId, message } = data;
        const meta = socketMetaMap.get(socket.id);
        if (!meta || !message) return;

        const chatPayload = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          user: meta.user,
          text: message.trim(),
          timestamp: new Date().toISOString(),
        };

        io.to(`room:${roomId}`).emit('chat:message', chatPayload);
      } catch (err) {
        console.error('[Socket] chat:message error:', err);
      }
    });

    // Handle explicit document save signal
    socket.on('document:saved', (data) => {
      try {
        const { roomId, fileId, fileName } = data;
        const meta = socketMetaMap.get(socket.id);
        socket.to(`room:${roomId}`).emit('room:notification', {
          type: 'save',
          message: `${meta?.user?.displayName || 'A collaborator'} saved ${fileName || 'the file'}`,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[Socket] document:saved error:', err);
      }
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
      try {
        const meta = socketMetaMap.get(socket.id);
        if (meta) {
          const { roomId, user } = meta;
          if (roomUsersMap.has(roomId)) {
            const usersMap = roomUsersMap.get(roomId);
            usersMap.delete(socket.id);

            const remainingCount = usersMap.size;
            const remainingUsers = Array.from(usersMap.values());

            // Broadcast leave notification
            socket.to(`room:${roomId}`).emit('room:user-left', {
              socketId: socket.id,
              user,
              users: remainingUsers,
              timestamp: new Date(),
            });

            // Clean up empty room map
            if (remainingCount === 0) {
              roomUsersMap.delete(roomId);
            }

            // Update room active count
            if (getDBStatus()) {
              Room.findOneAndUpdate({ roomId }, { activeUsersCount: remainingCount, lastActivity: new Date() }).catch(() => {});
            } else if (memoryStore.rooms.has(roomId)) {
              const r = memoryStore.rooms.get(roomId);
              r.activeUsersCount = remainingCount;
              r.updatedAt = new Date();
            }
          }
          socketMetaMap.delete(socket.id);
        }
        console.log(`[Socket] Client disconnected: ${socket.id}`);
      } catch (err) {
        console.error('[Socket] disconnect error:', err);
      }
    });
  });
};

module.exports = setupSocketHandler;
