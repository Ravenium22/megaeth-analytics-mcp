const { spawn } = require('child_process');

console.log('Ì∑™ Testing MCP Server for Claude Desktop...');

// Start the MCP server
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, LOG_LEVEL: 'error' } // Reduce log noise
});

let responses = [];

// Test 1: Initialize
const initRequest = {
  jsonrpc: '2.0',
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test-client', version: '1.0.0' }
  },
  id: 1
};

// Test 2: List tools
const listToolsRequest = {
  jsonrpc: '2.0',
  method: 'tools/list',
  id: 2
};

// Test 3: Call a tool
const callToolRequest = {
  jsonrpc: '2.0',
  method: 'tools/call',
  params: {
    name: 'get_network_stats',
    arguments: { timeframe: '1h' }
  },
  id: 3
};

// Send requests
setTimeout(() => {
  server.stdin.write(JSON.stringify(initRequest) + '\n');
}, 500);

setTimeout(() => {
  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 1000);

setTimeout(() => {
  server.stdin.write(JSON.stringify(callToolRequest) + '\n');
}, 1500);

// Handle responses
server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      responses.push(response);
      console.log('Ì≥® MCP Response:', JSON.stringify(response, null, 2));
    } catch (e) {
      // Skip non-JSON lines (logs)
    }
  });
});

server.stderr.on('data', (data) => {
  // Skip stderr for cleaner output
});

// Cleanup
setTimeout(() => {
  server.kill();
  
  console.log('\nÌæØ MCP Test Summary:');
  console.log(`‚úÖ Received ${responses.length} valid MCP responses`);
  
  if (responses.length >= 2) {
    console.log('‚úÖ MCP server is ready for Claude Desktop!');
    console.log('\nÌ∫Ä Next steps:');
    console.log('1. Install Claude Desktop');
    console.log('2. Copy claude_desktop_config.json to config location');
    console.log('3. Restart Claude Desktop');
    console.log('4. Ask Claude: "What is the current MegaETH network performance?"');
  } else {
    console.log('‚ùå MCP server needs debugging');
  }
}, 3000);
