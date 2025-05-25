// src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { MegaETHAnalytics } from './services/analytics';
import { DatabaseManager } from './database/manager';
import { WebSocketManager } from './services/websocket';
import { APIServer } from './api/server';
import { Logger } from './utils/logger';
import dotenv from 'dotenv';

dotenv.config();

class MegaETHMCPServer {
  private server: Server;
  private analytics: MegaETHAnalytics;
  private db: DatabaseManager;
  private wsManager: WebSocketManager;
  private apiServer: APIServer;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('MegaETHMCPServer');
    this.server = new Server(
      {
        name: 'megaeth-analytics',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.db = new DatabaseManager();
    this.analytics = new MegaETHAnalytics(this.db);
    this.wsManager = new WebSocketManager(this.analytics);
    this.apiServer = new APIServer(this.analytics);

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
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
        },
        {
          name: 'get_contract_functions',
          description: 'Analyze most popular smart contract functions and their usage patterns',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Number of top functions to return (default: 10)'
              }
            }
          }
        },
        {
          name: 'get_contract_types',
          description: 'Get distribution of smart contract types on MegaETH',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'get_new_deployments',
          description: 'Find recently deployed smart contracts',
          inputSchema: {
            type: 'object',
            properties: {
              hours: {
                type: 'number',
                description: 'How many hours back to search (default: 24)'
              }
            }
          }
        },
        {
          name: 'analyze_contract_ecosystem',
          description: 'Comprehensive analysis of the MegaETH smart contract ecosystem',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_network_stats':
            return await this.handleNetworkStats(args);
          case 'analyze_transactions':
            return await this.handleAnalyzeTransactions(args);
          case 'get_active_contracts':
            return await this.handleActiveContracts(args);
          case 'detect_whales':
            return await this.handleDetectWhales(args);
          case 'get_user_behavior':
            return await this.handleUserBehavior(args);
          case 'monitor_defi_activity':
            return await this.handleDeFiActivity(args);
          case 'get_contract_functions':
            return await this.handleContractFunctions(args);
          case 'get_contract_types':
            return await this.handleContractTypes(args);
          case 'get_new_deployments':
            return await this.handleNewDeployments(args);
          case 'analyze_contract_ecosystem':
            return await this.handleContractEcosystem(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        this.logger.error(`Error handling tool ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ]
        };
      }
    });
  }

  private async handleNetworkStats(args: any) {
    const timeframe = args?.timeframe || '1h';
    const stats = await this.analytics.getNetworkStats(timeframe);
    
    return {
      content: [
        {
          type: 'text',
          text: `**MegaETH Network Statistics (${timeframe}):**

📊 **Current TPS:** ${stats.currentTPS}
⛽ **Average Gas Price:** ${stats.avgGasPrice} Gwei
🕒 **Average Block Time:** ${stats.avgBlockTime}ms
📦 **Total Transactions:** ${stats.totalTransactions}
💰 **Total Volume:** ${stats.totalVolume} ETH
🔥 **Gas Utilization:** ${stats.gasUtilization}%

**Transaction Types:**
${stats.transactionTypes.map((t: any) => `  • ${t.type}: ${t.count} (${t.percentage}%)`).join('\n')}

*MegaETH's 10ms mini-blocks enable ultra-fast transaction processing compared to traditional blockchains.*`
        }
      ]
    };
  }

  private async handleAnalyzeTransactions(args: any) {
    const limit = args?.limit || 100;
    const contractAddress = args?.contract_address;
    const analysis = await this.analytics.analyzeTransactions(limit, contractAddress);
    
    return {
      content: [
        {
          type: 'text',
          text: `**Transaction Analysis** (${limit} recent transactions):

📈 **Success Rate:** ${analysis.successRate}%
⛽ **Average Gas Used:** ${analysis.avgGasUsed}
💰 **Average Transaction Value:** ${analysis.avgValue} ETH

**Transaction Categories:**
${analysis.categories.map((c: any) => `  • ${c.type}: ${c.count} (${c.percentage}%)`).join('\n')}

**Most Active Contracts:**
${analysis.topContracts.map((c: any) => `  • ${c.address}: ${c.interactions} interactions`).join('\n')}

*Analysis shows MegaETH's high throughput with excellent success rates.*`
        }
      ]
    };
  }

  private async handleActiveContracts(args: any) {
    const limit = args?.limit || 10;
    const timeframe = args?.timeframe || '24h';
    const contracts = await this.analytics.getActiveContracts(limit, timeframe);
    
    return {
      content: [
        {
          type: 'text',
          text: `**Most Active Smart Contracts** (${timeframe}):

${contracts.map((c: any, i: number) => 
  `**${i + 1}. ${c.address}**
   • Interactions: ${c.interactions}
   • Unique Users: ${c.unique_users}
   • Total Gas: ${c.total_gas}
   • Type: ${c.contract_type || 'Unknown'}`
).join('\n\n')}

*These contracts show the most activity on MegaETH's high-performance network.*`
        }
      ]
    };
  }

  private async handleDetectWhales(args: any) {
    const threshold = args?.threshold || 10;
    const timeframe = args?.timeframe || '24h';
    const whales = await this.analytics.detectWhaleActivity(threshold, timeframe);
    
    return {
      content: [
        {
          type: 'text',
          text: `**🐋 Whale Activity Detection** (${timeframe}, >${threshold} ETH):

${whales.length === 0 ? '**No significant whale activity detected.**\n\n*MegaETH testnet primarily consists of smart contract testing with minimal ETH transfers. This is normal for testnet environments.*' : 
  whales.map((w: any) => 
    `💰 **${w.value} ETH** - ${w.from} → ${w.to}
   • Hash: ${w.hash}
   • Time: ${new Date(w.timestamp).toISOString()}
   • Type: ${w.type}
   • Block: ${w.blockNumber || 'N/A'}`
  ).join('\n\n')}

*MegaETH's 10ms blocks enable real-time whale detection capabilities.*`
        }
      ]
    };
  }

  private async handleUserBehavior(args: any) {
    const address = args?.address;
    const metric = args?.metric || 'activity';
    const behavior = await this.analytics.analyzeUserBehavior(address, metric);
    
    return {
      content: [
        {
          type: 'text',
          text: address ? 
            `**User Behavior Analysis** for ${address}:

📊 **Activity Score:** ${behavior.activityScore}/100
🔄 **Transaction Count:** ${behavior.transactionCount}
💰 **Total Volume:** ${behavior.totalVolume} ETH
📅 **Active Days:** ${behavior.activeDays}
🎯 **Most Used Contracts:** ${behavior.topContracts?.join(', ') || 'None'}
📈 **Trend:** ${behavior.trend}` :
            `**Network User Behavior Metrics:**

👥 **Active Users (24h):** ${behavior.activeUsers24h}
🆕 **New Users Today:** ${behavior.newUsersToday}
🔄 **Returning Users:** ${behavior.returningUsers}
📊 **Average Transactions per User:** ${behavior.avgTransactionsPerUser}
💰 **Average Volume per User:** ${behavior.avgVolumePerUser} ETH
📈 **User Retention Rate:** ${behavior.retentionRate}%

*MegaETH's fast transaction processing enables better user experience and higher engagement.*`
        }
      ]
    };
  }

  private async handleDeFiActivity(args: any) {
    const protocolType = args?.protocol_type || 'all';
    const timeframe = args?.timeframe || '24h';
    const defi = await this.analytics.monitorDeFiActivity(protocolType, timeframe);
    
    return {
      content: [
        {
          type: 'text',
          text: `**DeFi Activity Monitor** (${protocolType}, ${timeframe}):

📊 **Total Volume:** ${defi.totalVolume} ETH
🔄 **Total Transactions:** ${defi.totalTransactions}
👥 **Unique Users:** ${defi.uniqueUsers}

${protocolType === 'all' || protocolType === 'dex' ? `
**🔄 DEX Activity:**
  • Volume: ${defi.dex?.volume || 0} ETH
  • Trades: ${defi.dex?.trades || 0}
  • Average Trade Size: ${defi.dex?.avgTradeSize || 0} ETH
` : ''}

${protocolType === 'all' || protocolType === 'lending' ? `
**🏦 Lending Activity:**
  • Total Lent: ${defi.lending?.totalLent || 0} ETH
  • Total Borrowed: ${defi.lending?.totalBorrowed || 0} ETH
  • Active Positions: ${defi.lending?.activePositions || 0}
` : ''}

**Top Protocols:**
${defi.topProtocols?.map((p: any) => `  • ${p.name}: ${p.volume} ETH`).join('\n') || 'None detected'}

*MegaETH's 10ms blocks enable near-instant DeFi operations with minimal MEV opportunities.*`
        }
      ]
    };
  }

  private async handleContractFunctions(args: any) {
    const limit = args?.limit || 10;
    const functions = await this.analytics.getContractFunctions(limit);
    
    return {
      content: [
        {
          type: 'text',
          text: `**📋 Most Popular Smart Contract Functions** (Top ${limit}):

**Total Functions Analyzed:** ${functions.totalFunctions}

${functions.functions.map((f: any, i: number) => 
  `**${i + 1}. ${f.name}**
   • Signature: \`${f.signature}\`
   • Call Count: ${f.callCount}
   • Total Gas Used: ${f.gasUsage.toLocaleString()}
   • Average Gas per Call: ${f.avgGasPerCall.toLocaleString()}`
).join('\n\n')}

*These functions show what operations are most common on MegaETH's high-speed network.*`
        }
      ]
    };
  }

  private async handleContractTypes(args: any) {
    const typeStats = await this.analytics.getContractTypeStats();
    
    return {
      content: [
        {
          type: 'text',
          text: `**🏗️ Smart Contract Type Distribution**:

**Total Active Contracts:** ${typeStats.totalContracts}

${typeStats.distribution.map((type: any, i: number) => 
  `**${i + 1}. ${type.type}**
   • Count: ${type.count}
   • Percentage: ${type.percentage}%`
).join('\n\n')}

*This shows what types of applications are being built on MegaETH's ultra-fast blockchain.*`
        }
      ]
    };
  }

  private async handleNewDeployments(args: any) {
    const hours = args?.hours || 24;
    const deployments = await this.analytics.getNewDeployments(hours);
    
    return {
      content: [
        {
          type: 'text',
          text: `**🆕 New Contract Deployments** (Last ${hours} hours):

**Total New Contracts:** ${deployments.totalDeployments}

${deployments.deployments.length === 0 ? 
  '*No new deployments found in the specified timeframe.*' :
  deployments.deployments.map((d: any, i: number) => 
    `**${i + 1}. ${d.address}**
     • Type: ${d.type}
     • Creator: ${d.creator}
     • Block: ${d.creationBlock}
     • Gas Used: ${d.gasUsed.toLocaleString()}
     • Time: ${new Date(d.timestamp).toLocaleString()}`
  ).join('\n\n')
}

*MegaETH's fast deployment times encourage rapid development and testing.*`
        }
      ]
    };
  }

  private async handleContractEcosystem(args: any) {
    const ecosystem = await this.analytics.analyzeContractEcosystem();
    
    return {
      content: [
        {
          type: 'text',
          text: `**🌐 MegaETH Contract Ecosystem Analysis**

## 📊 **Summary**
• **Active Contracts:** ${ecosystem.summary.totalActiveContracts}
• **Total Function Calls:** ${ecosystem.summary.totalFunctionCalls.toLocaleString()}
• **Most Popular Type:** ${ecosystem.summary.mostPopularType}
• **New Deployments Today:** ${ecosystem.summary.newDeploymentsToday}

## 🔥 **Most Active Contracts**
${ecosystem.activeContracts.map((c: any, i: number) => 
  `**${i + 1}. ${c.address}**
   • Type: ${c.contract_type || 'Unknown'}
   • Interactions: ${c.interactions}
   • Users: ${c.unique_users}
   • Gas: ${c.total_gas?.toLocaleString() || 'N/A'}`
).join('\n\n')}

## ⚡ **Popular Functions**
${ecosystem.popularFunctions.map((f: any) => 
  `• **${f.name}**: ${f.callCount} calls`
).join('\n')}

## 🏗️ **Contract Types**
${ecosystem.contractTypes.map((t: any) => 
  `• **${t.type}**: ${t.count} contracts (${t.percentage}%)`
).join('\n')}

## 🆕 **Recent Deployments**
${ecosystem.recentDeployments.length === 0 ? 
  '• No recent deployments found' :
  ecosystem.recentDeployments.map((d: any) => 
    `• **${d.type}** at ${d.address} by ${d.creator}`
  ).join('\n')
}

*MegaETH's 10ms blocks enable a thriving ecosystem of high-frequency applications.*`
        }
      ]
    };
  }

  async start() {
    try {
      // Initialize database
      await this.db.initialize();
      this.logger.info('Database initialized');

      // Start WebSocket manager (disabled in MCP mode to avoid interference)
      if (process.env.MCP_MODE !== 'true') {
        // await this.wsManager.start(); // Disabled - WebSocket not available
        // this.logger.info('WebSocket manager started');
      }

      // Start API server (only if not in MCP mode)
      if (process.env.MCP_MODE !== 'true') {
        await this.apiServer.start();
        this.logger.info('API server started on port 3000');
      }

      // Start MCP server
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      this.logger.info('MCP server started');

    } catch (error) {
      this.logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  async stop() {
    await this.wsManager.stop();
    await this.apiServer.stop();
    await this.db.close();
    this.logger.info('Server stopped');
  }
}

// Start the server
const server = new MegaETHMCPServer();

process.on('SIGINT', async () => {
  console.error('Shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
