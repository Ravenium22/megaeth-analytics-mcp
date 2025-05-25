import express from 'express';
import { MegaETHAnalytics } from '../services/analytics';
import { Logger } from '../utils/logger';

export class APIServer {
  private app: express.Application;
  private server: any;
  private analytics: MegaETHAnalytics;
  private logger: Logger;

  constructor(analytics: MegaETHAnalytics) {
    this.analytics = analytics;
    this.logger = new Logger('APIServer');
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });
  }

  private setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Network stats - WORKING
    this.app.get('/api/stats', async (req, res) => {
      try {
        const timeframe = (req.query.timeframe as string) || '1h';
        const stats = await this.analytics.getNetworkStats(timeframe);
        res.json(stats);
      } catch (error) {
        this.logger.error('Error getting stats:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Active contracts - ADD THIS
    this.app.get('/api/contracts', async (req, res) => {
      try {
        const limit = parseInt(req.query.limit as string) || 10;
        const timeframe = (req.query.timeframe as string) || '24h';
        const contracts = await this.analytics.getActiveContracts(limit, timeframe);
        res.json(contracts);
      } catch (error) {
        this.logger.error('Error getting active contracts:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Contract functions
    this.app.get('/api/contracts/functions', async (req, res) => {
      try {
        const limit = parseInt(req.query.limit as string) || 10;
        const functions = await this.analytics.getContractFunctions(limit);
        res.json(functions);
      } catch (error) {
        this.logger.error('Error getting contract functions:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Contract types
    this.app.get('/api/contracts/types', async (req, res) => {
      try {
        const types = await this.analytics.getContractTypeStats();
        res.json(types);
      } catch (error) {
        this.logger.error('Error getting contract type stats:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Contract deployments
    this.app.get('/api/contracts/deployments', async (req, res) => {
      try {
        const hours = parseInt(req.query.hours as string) || 24;
        const deployments = await this.analytics.getNewDeployments(hours);
        res.json(deployments);
      } catch (error) {
        this.logger.error('Error getting new deployments:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Contract ecosystem
    this.app.get('/api/contracts/ecosystem', async (req, res) => {
      try {
        const ecosystem = await this.analytics.analyzeContractEcosystem();
        res.json(ecosystem);
      } catch (error) {
        this.logger.error('Error analyzing contract ecosystem:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Whale detection - ADD THIS
    this.app.get('/api/whales', async (req, res) => {
      try {
        const threshold = parseFloat(req.query.threshold as string) || 10;
        const timeframe = (req.query.timeframe as string) || '24h';
        const whales = await this.analytics.detectWhaleActivity(threshold, timeframe);
        res.json(whales);
      } catch (error) {
        this.logger.error('Error detecting whales:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Transaction analysis - ADD THIS
    this.app.get('/api/transactions/analyze', async (req, res) => {
      try {
        const limit = parseInt(req.query.limit as string) || 100;
        const contractAddress = req.query.contract as string;
        const analysis = await this.analytics.analyzeTransactions(limit, contractAddress);
        res.json(analysis);
      } catch (error) {
        this.logger.error('Error analyzing transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // User behavior - ADD THIS
    this.app.get('/api/users', async (req, res) => {
      try {
        const address = req.query.address as string;
        const metric = (req.query.metric as string) || 'activity';
        const behavior = await this.analytics.analyzeUserBehavior(address, metric);
        res.json(behavior);
      } catch (error) {
        this.logger.error('Error analyzing user behavior:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // DeFi monitoring - ADD THIS
    this.app.get('/api/defi', async (req, res) => {
      try {
        const protocol = (req.query.protocol as string) || 'all';
        const timeframe = (req.query.timeframe as string) || '24h';
        const defi = await this.analytics.monitorDeFiActivity(protocol, timeframe);
        res.json(defi);
      } catch (error) {
        this.logger.error('Error monitoring DeFi:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // API documentation
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'MegaETH Analytics API',
        version: '1.0.0',
        endpoints: {
          'GET /health': 'Health check',
          'GET /api/stats?timeframe=1h': 'Network statistics',
          'GET /api/contracts?limit=10': 'Active contracts',
          'GET /api/whales?threshold=10': 'Whale transactions',
          'GET /api/transactions/analyze?limit=100': 'Transaction analysis',
          'GET /api/users?address=0x...': 'User behavior analysis',
          'GET /api/defi?protocol=all': 'DeFi activity monitoring'
        }
      });
    });
  }

  async start() {
    const port = process.env.API_PORT || 3000;
    this.server = this.app.listen(port, () => {
      this.logger.info(`API server listening on port ${port}`);
    });
  }

  async stop() {
    if (this.server) {
      this.server.close();
      this.logger.info('API server stopped');
    }
  }
}
