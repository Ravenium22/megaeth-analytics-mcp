const fs = require('fs');

let content = fs.readFileSync('src/index.ts', 'utf8');

// Find the tools array and replace it with all 6 tools
const newToolsArray = `tools: [
        {
          name: 'get_network_stats',
          description: 'Get real-time network statistics including TPS, gas usage, and block times',
          inputSchema: {
            type: 'object',
            properties: {
              timeframe: {
                type: 'string',
                enum: ['1m', '5m', '1h', '24h'],
                description: 'Time frame for statistics'
              }
            }
          }
        },
        {
          name: 'analyze_transactions',
          description: 'Analyze transaction patterns and categorize them',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Number of recent transactions to analyze'
              },
              contract_address: {
                type: 'string',
                description: 'Filter by specific contract address'
              }
            }
          }
        },
        {
          name: 'get_active_contracts',
          description: 'Get most active smart contracts by interaction count',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Number of contracts to return'
              },
              timeframe: {
                type: 'string',
                enum: ['1h', '24h', '7d'],
                description: 'Time frame for activity analysis'
              }
            }
          }
        },
        {
          name: 'detect_whales',
          description: 'Detect large transactions and whale activity',
          inputSchema: {
            type: 'object',
            properties: {
              threshold: {
                type: 'number',
                description: 'Minimum transaction value in ETH to consider as whale activity'
              },
              timeframe: {
                type: 'string',
                enum: ['1h', '24h', '7d'],
                description: 'Time frame to analyze'
              }
            }
          }
        },
        {
          name: 'get_user_behavior',
          description: 'Analyze user behavior patterns and metrics',
          inputSchema: {
            type: 'object',
            properties: {
              address: {
                type: 'string',
                description: 'Specific address to analyze (optional)'
              },
              metric: {
                type: 'string',
                enum: ['activity', 'retention', 'transaction_patterns'],
                description: 'Type of behavior metric to analyze'
              }
            }
          }
        },
        {
          name: 'monitor_defi_activity',
          description: 'Monitor DeFi protocol activity including DEX trades and lending',
          inputSchema: {
            type: 'object',
            properties: {
              protocol_type: {
                type: 'string',
                enum: ['dex', 'lending', 'yield_farming', 'all'],
                description: 'Type of DeFi protocol to monitor'
              },
              timeframe: {
                type: 'string',
                enum: ['1h', '24h', '7d'],
                description: 'Time frame for analysis'
              }
            }
          }
        }
      ]`;

// Replace the tools section
const toolsStart = content.indexOf('tools: [');
const toolsEnd = content.indexOf(']', toolsStart) + 1;
const before = content.substring(0, toolsStart);
const after = content.substring(toolsEnd);

const newContent = before + newToolsArray + after;

fs.writeFileSync('src/index.ts', newContent);
console.log('✅ Added all 6 MCP tools');
