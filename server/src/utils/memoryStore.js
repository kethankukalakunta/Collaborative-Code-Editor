// High-performance in-memory fallback store and cache layer
const memoryStore = {
  users: new Map(),
  projects: new Map(),
  rooms: new Map(),
  documents: new Map(), // key: `${roomId}:${fileId}`
  
  // Seed sample public project for instant testing
  init() {
    if (this.rooms.size === 0) {
      const defaultRoomId = 'demo-room';
      this.rooms.set(defaultRoomId, {
        roomId: defaultRoomId,
        roomName: 'Collaborative Sandbox (Demo)',
        visibility: 'public',
        language: 'javascript',
        isGuestAllowed: true,
        activeUsersCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      this.documents.set(`${defaultRoomId}:main`, {
        roomId: defaultRoomId,
        fileId: 'main',
        fileName: 'index.js',
        language: 'javascript',
        encodedState: '',
        textSnapshot: `// Welcome to Real-Time Collaborative Code Editor!\n// Multiple users can edit code together with instant CRDT synchronization.\n\nfunction calculateStats(numbers) {\n  if (!numbers || numbers.length === 0) return null;\n  \n  const sum = numbers.reduce((acc, curr) => acc + curr, 0);\n  const avg = sum / numbers.length;\n  const max = Math.max(...numbers);\n  const min = Math.min(...numbers);\n  \n  return { sum, avg, min, max };\n}\n\nconst sampleData = [12, 45, 68, 23, 89, 94, 31];\nconsole.log("Calculated Stats:", calculateStats(sampleData));\n`,
        version: 1,
        updatedAt: new Date(),
      });
    }
  }
};

memoryStore.init();

module.exports = memoryStore;
