import WebSocket from 'ws';
import { MegaETHAnalytics } from './analytics';
import { Logger } from '../utils/logger';

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private analytics: MegaETHAnalytics;
  private logger: Logger;
  private isConnected = false;

  constructor(analytics: MegaETHAnalytics) {
    this.analytics = analytics;
    this.logger = new Logger('WebSocketManager');
  }

  async start() {
    await this.connect();
    this.setupSubscriptions();
  }

  private async connect() {
    try {
      const wsUrl = process.env.MEGAETH_WS_URL || 'wss://carrot.megaeth.com/rpc';
      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        this.logger.info('WebSocket connected to MegaETH');
        this.isConnected = true;
      });

      this.ws.on('message', (data) => {
        this.handleMessage(data.toString());
      });

      this.ws.on('close', () => {
        this.logger.warn('WebSocket connection closed');
        this.isConnected = false;
      });

    } catch (error) {
      this.logger.error('Failed to connect WebSocket:', error);
    }
  }

  private setupSubscriptions() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      setTimeout(() => this.setupSubscriptions(), 1000);
      return;
    }

    // Subscribe to mini blocks
    this.subscribe('fragment');
  }

  private subscribe(type: string, params?: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const subscription = {
      jsonrpc: '2.0',
      method: 'eth_subscribe',
      params: params ? [type, params] : [type],
      id: Date.now()
    };

    this.ws.send(JSON.stringify(subscription));
    this.logger.info(`Subscribed to ${type}`);
  }

  private async handleMessage(message: string) {
    // Handle incoming WebSocket messages
  }

  async stop() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}
