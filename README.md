# 🚀 MegaETH Analytics MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-2024--11--05-purple)](https://modelcontextprotocol.io/)

A comprehensive **Model Context Protocol (MCP) server** that provides real-time analytics for the MegaETH blockchain. This server enables AI agents (like Claude Desktop) to query live blockchain data, analyze smart contracts, and provide deep insights into MegaETH's ultra-fast 10ms blockchain network.

## ✨ Features

### 🔍 **Real-Time Network Analytics**
- **Live TPS monitoring** (1000+ transactions per second)
- **Gas price tracking** and utilization metrics
- **Block time analysis** leveraging MegaETH's 10ms mini-blocks
- **Transaction success rates** and volume metrics

### 🏗️ **Smart Contract Intelligence**
- **Active contract discovery** from live blockchain data
- **Contract interaction analysis** with user metrics
- **Function call popularity** and gas usage patterns
- **Contract type classification** (ERC20, DEX, DeFi, etc.)
- **Deployment tracking** with creator information

### 🐋 **Advanced Analytics**
- **Whale transaction detection** with configurable thresholds
- **User behavior analysis** and retention metrics
- **DeFi protocol monitoring** (DEX, lending, yield farming)
- **Cross-contract interaction patterns**

### 🤖 **AI Integration**
- **Claude Desktop compatible** via MCP protocol
- **6 specialized tools** for blockchain analysis
- **Natural language queries** about blockchain data
- **RESTful API** for external integrations

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager
- Access to MegaETH RPC endpoint

### Installation

```bash
# Clone the repository
git clone https://github.com/RaveniumNFT/megaeth-analytics-mcp.git
cd megaeth-analytics-mcp

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit configuration
nano .env
```

### Environment Configuration

```env
# MegaETH Network
MEGAETH_RPC_URL=https://carrot.megaeth.com/rpc
MEGAETH_WS_URL=wss://carrot.megaeth.com/rpc

# Database (SQLite for development)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=megaeth_analytics
DB_USER=postgres
DB_PASSWORD=your_password

# Server Configuration
API_PORT=3000
LOG_LEVEL=info
MCP_MODE=false
```

### Development Setup

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Testing the API

```bash
# Test network statistics
curl http://localhost:3000/api/stats

# Test active contracts
curl http://localhost:3000/api/contracts

# Test function analysis
curl http://localhost:3000/api/contracts/functions

# Test ecosystem overview
curl http://localhost:3000/api/contracts/ecosystem
```

## 🤖 Claude Desktop Integration

### Setup MCP Server

1. **Install Claude Desktop** from [claude.ai/download](https://claude.ai/download)

2. **Configure MCP Server** - Add to your Claude Desktop config:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux:** `~/.config/claude-desktop/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "megaeth-analytics": {
      "command": "node",
      "args": ["/path/to/megaeth-analytics-mcp/dist/index.js"],
      "env": {
        "MCP_MODE": "true",
        "LOG_LEVEL": "error",
        "MEGAETH_RPC_URL": "https://carrot.megaeth.com/rpc"
      }
    }
  }
}
```

3. **Restart Claude Desktop**

4. **Test Integration** - Ask Claude:
   - *"What is the current MegaETH network performance?"*
   - *"Show me the most active smart contracts on MegaETH"*
   - *"Analyze recent transaction patterns"*
   - *"What functions are being called most on MegaETH?"*

## 🛠️ Available MCP Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_network_stats` | Real-time network statistics | `timeframe`: 1m, 5m, 1h, 24h |
| `analyze_transactions` | Transaction pattern analysis | `limit`, `contract_address` |
| `get_active_contracts` | Most active smart contracts | `limit`, `timeframe` |
| `detect_whales` | Large transaction detection | `threshold`, `timeframe` |
| `get_user_behavior` | User behavior analytics | `address`, `metric` |
| `monitor_defi_activity` | DeFi protocol monitoring | `protocol_type`, `timeframe` |

## 📊 API Endpoints

### Network Analytics
- `GET /api/stats` - Network statistics
- `GET /api/stats?timeframe=1h` - Stats for specific timeframe

### Smart Contracts
- `GET /api/contracts` - Active contracts list
- `GET /api/contracts/functions` - Popular function analysis
- `GET /api/contracts/types` - Contract type distribution
- `GET /api/contracts/deployments` - Recent deployments
- `GET /api/contracts/ecosystem` - Ecosystem overview

### Advanced Analytics
- `GET /api/whales` - Whale transaction detection
- `GET /api/users` - User behavior analysis
- `GET /api/defi` - DeFi activity monitoring

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Claude AI     │    │   MCP Server     │    │   MegaETH RPC   │
│                 │◄──►│                  │◄──►│                 │
│ Natural Language│    │ Analytics Engine │    │ Blockchain Data │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   SQLite DB      │
                       │ Contract Cache   │
                       └──────────────────┘
```

### Key Components

- **MCP Server**: Implements Model Context Protocol for AI integration
- **Analytics Engine**: Processes and analyzes blockchain data
- **Contract Analyzer**: Discovers and categorizes smart contracts
- **Database Layer**: Caches contract data and analytics
- **API Server**: RESTful endpoints for external integrations

## 🤝 Contributing

I am open contributions to improve MegaETH Analytics! Here's how you can help:

### 🟢 What You CAN Do

- **Submit bug reports** with detailed reproduction steps
- **Propose new features** via GitHub issues
- **Improve documentation** and code comments
- **Add new analytics methods** for contract analysis
- **Enhance MCP tool functionality**
- **Add support for new contract types**
- **Optimize performance** and reduce API calls
- **Add tests** for existing functionality

### 🔴 What You CANNOT Do

- **Redistribute** this software under a different license
- **Remove copyright notices** or attribution
- **Use the codebase** for commercial products without permission
- **Create competing services** using this codebase
- **Modify license terms** or claim ownership

### Contribution Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Conventional commits** for clear history
- **Comprehensive comments** for complex logic

## 📈 Performance & Limitations

### Performance Characteristics
- **Processes 1000+ TPS** from MegaETH network
- **Sub-second response times** for cached data
- **10ms latency** for real-time mini-block data
- **Efficient rate limiting** to respect RPC endpoints

### Current Limitations
- **Testnet only** - Mainnet support coming soon
- **Rate limited** by MegaETH RPC endpoints
- **Contract analysis** limited to recent blocks
- **Historical data** requires additional storage

## 🔧 Advanced Configuration

### Database Options

**SQLite (Default - Development)**
```env
# No additional configuration needed
```

**PostgreSQL (Production)**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=megaeth_analytics
DB_USER=postgres
DB_PASSWORD=your_secure_password
```

### Logging Configuration

```env
LOG_LEVEL=info  # error, warn, info, debug
```

### MCP Mode
```env
MCP_MODE=true   # Disables console logging for Claude Desktop
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t megaeth-analytics .

# Run container
docker run -p 3000:3000 -e MEGAETH_RPC_URL=https://carrot.megaeth.com/rpc megaeth-analytics
```

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment**
   ```bash
   export NODE_ENV=production
   export MCP_MODE=false
   ```

3. **Start the server**
   ```bash
   npm start
   ```

## 📊 Live Analytics Dashboard

For a complete analytics dashboard with beautiful visualizations, visit:
**[MegaETH Analytics Dashboard](https://megaeth-analytics.up.railway.app)**

## 🤖 Example Claude Interactions

```
Human: What's the current MegaETH network performance?

Claude: Based on the latest MegaETH analytics:

📊 **Network Performance (Real-time)**
• Current TPS: 1,089 transactions per second
• Block Time: 24ms (ultra-fast!)
• Gas Usage: 3% utilization
• Success Rate: 100%

The network is performing exceptionally well with:
- 983 transactions in the latest block
- 100% contract call activity (active ecosystem)
- Minimal gas costs due to low congestion

MegaETH's 10ms mini-blocks enable this incredible throughput!
```

## 📄 License & Rights

### Copyright & Ownership
- **All rights reserved** to [@RaveniumNFT](https://twitter.com/RaveniumNFT)
- **Original work** created for the MegaETH ecosystem
- **Commercial use** requires explicit permission

### MIT License

```
MIT License

Copyright (c) 2025 RaveniumNFT

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **MegaETH Team** for building an incredible 10ms blockchain
- **Anthropic** for the Model Context Protocol specification
- **Claude AI** for enabling natural language blockchain analysis
- **Open source community** for the amazing tools and libraries

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/RaveniumNFT/megaeth-analytics-mcp/issues)
- **Twitter**: [@RaveniumNFT](https://twitter.com/RaveniumNFT)

---

**Built with ❤️ for the MegaETH ecosystem**

*Empowering AI agents with real-time blockchain intelligence*