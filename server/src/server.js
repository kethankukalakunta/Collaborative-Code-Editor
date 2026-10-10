require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB } = require('./config/db');
const setupSocketHandler = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const server = http.createServer(app);

// Initialize Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow Vercel, localhost, and any origin
      callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
  pingInterval: 25000,
  maxHttpBufferSize: 5e6, // 5MB buffer for large CRDT payloads
});

// Setup Real-Time Socket.IO & Yjs event handlers
setupSocketHandler(io);

// Connect to MongoDB and start server
const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Collaborative Code Editor Backend Running`);
    console.log(`📡 Server Address: http://localhost:${PORT}`);
    console.log(`🌐 Client Allowed: ${CLIENT_URL}`);
    console.log(`====================================================`);
  });
};

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
