import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  private constructor() {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Configure winston logger
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: { service: 'playwright-tests' },
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        // File transport for all logs
        new winston.transports.File({
          filename: path.join(logsDir, 'test-execution.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        // File transport for errors only
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ]
    });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public error(message: string, error?: Error): void {
    this.logger.error(message, error);
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  public startTestLog(testName: string): void {
    this.logger.info(`========== Starting Test: ${testName} ==========`);
  }

  public endTestLog(testName: string, status: 'PASSED' | 'FAILED' | 'SKIPPED'): void {
    this.logger.info(`========== Test ${status}: ${testName} ==========`);
  }
}

// Create and export a logger instance for convenience
export const logger = Logger.getInstance();