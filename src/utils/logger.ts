import winston from 'winston';

export class Logger {
  private logger: winston.Logger;

  constructor(service: string) {
    // Check if running as MCP server (Claude Desktop)
    const isMCPMode = process.argv.includes('--mcp') || process.env.MCP_MODE === 'true';
    
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service },
      transports: [
        // Always log errors and info to files
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        // Only log to console if NOT in MCP mode (to avoid JSON protocol interference)
        ...(isMCPMode ? [] : [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
          })
        ])
      ]
    });
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  error(message: string, error?: any) {
    // Always log errors to stderr so Claude Desktop can see them
    if (process.env.MCP_MODE === 'true') {
      console.error(`[ERROR] ${message}`, error);
    }
    this.logger.error(message, error);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }
}
