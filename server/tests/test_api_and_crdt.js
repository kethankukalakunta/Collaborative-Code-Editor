const axios = require('axios');
const Y = require('yjs');

const BASE_URL = 'http://localhost:5001/api/v1';

async function runTests() {
  console.log('--- STARTING COLLABORATIVE CODE EDITOR SYSTEM TESTS ---');
  let testsPassed = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      testsPassed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  try {
    // 1. Test Health endpoint
    const healthRes = await axios.get('http://localhost:5001/api/health');
    assert(healthRes.data.status === 'ok', 'Server health check returns ok');

    // 2. Test Guest Authentication
    const guestRes = await axios.post(`${BASE_URL}/auth/guest`, { displayName: 'Tester 1' });
    assert(guestRes.data.success === true && guestRes.data.data.token, 'Guest token generated');
    const guestToken = guestRes.data.data.token;

    // 3. Test Room Creation & Auto-Provisioning
    const testRoomId = `test-room-${Date.now()}`;
    const roomRes = await axios.get(`${BASE_URL}/rooms/${testRoomId}`);
    assert(roomRes.data.success === true && roomRes.data.data.roomId === testRoomId, 'Room provisioned & retrieved');

    // 4. Test Code Execution Sandbox (JavaScript runner)
    const execRes = await axios.post(`${BASE_URL}/execute`, {
      language: 'javascript',
      code: 'const a = 10; const b = 20; console.log("SUM:", a + b);',
    });
    assert(
      execRes.data.success === true && execRes.data.data.stdout.includes('SUM: 30'),
      'Code execution returns stdout correctly'
    );

    // 5. Test Yjs CRDT Mathematical Conflict-Free Merge
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    const text1 = doc1.getText('monaco');
    const text2 = doc2.getText('monaco');

    text1.insert(0, 'Hello ');
    const update1 = Y.encodeStateAsUpdate(doc1);

    // Sync doc1 to doc2
    Y.applyUpdate(doc2, update1);
    assert(text2.toString() === 'Hello ', 'CRDT initial sync matches');

    // Concurrent simultaneous edits
    text1.insert(6, 'World from Peer 1! ');
    text2.insert(6, 'Teammates from Peer 2! ');

    const update1_concurrent = Y.encodeStateAsUpdate(doc1);
    const update2_concurrent = Y.encodeStateAsUpdate(doc2);

    // Exchange updates
    Y.applyUpdate(doc1, update2_concurrent);
    Y.applyUpdate(doc2, update1_concurrent);

    assert(
      text1.toString() === text2.toString(),
      `CRDT concurrent edits merged deterministically to identical string: "${text1.toString()}"`
    );

    console.log(`\n==============================================`);
    console.log(`TEST SUMMARY: ${testsPassed}/${totalTests} tests passed successfully.`);
    console.log(`==============================================\n`);
  } catch (err) {
    console.error('Test execution failed with error:', err.response?.data || err.message);
  }
}

module.exports = runTests;

if (require.main === module) {
  runTests();
}
