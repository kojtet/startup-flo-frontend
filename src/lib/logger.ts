export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  context?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  private createLogEntry(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      context
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isTest) return false;
    if (this.isDevelopment) return true;
    
    // In production, only log errors and warnings
    return level === LogLevel.ERROR || level === LogLevel.WARN;
  }

  private formatMessage(entry: LogEntry): string {
    const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}`;
    const context = entry.context ? ` [${entry.context}]` : '';
    return `${prefix}${context}: ${entry.message}`;
  }

  private log(level: LogLevel, message: string, data?: any, context?: string): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, data, context);
    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, data);
        break;
      case LogLevel.INFO:
        console.log(formattedMessage, data);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, data);
        // In production, send to error reporting service
        if (!this.isDevelopment) {
          this.reportError(entry);
        }
        break;
    }
  }

  private reportError(entry: LogEntry): void {
    // TODO: Integrate with error reporting service (Sentry, etc.)
    // For now, we'll just ensure errors are properly logged
    try {
      // Send to error reporting service
      // sentry.captureException(entry);
    } catch (reportingError) {
      // Fallback to console if error reporting fails
      console.error('Error reporting failed:', reportingError);
    }
  }

  debug(message: string, data?: any, context?: string): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  info(message: string, data?: any, context?: string): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  warn(message: string, data?: any, context?: string): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  error(message: string, data?: any, context?: string): void {
    this.log(LogLevel.ERROR, message, data, context);
  }

  // Convenience methods for common use cases
  apiRequest(method: string, endpoint: string, data?: any): void {
    this.debug(`API Request: ${method} ${endpoint}`, data, 'API');
  }

  apiResponse(method: string, endpoint: string, status: number, data?: any): void {
    if (status >= 400) {
      this.error(`API Error: ${method} ${endpoint} - ${status}`, data, 'API');
    } else {
      this.debug(`API Response: ${method} ${endpoint} - ${status}`, data, 'API');
    }
  }

  apiError(method: string, endpoint: string, error: any): void {
    this.error(`API Error: ${method} ${endpoint}`, error, 'API');
  }

  userAction(action: string, data?: any): void {
    this.info(`User Action: ${action}`, data, 'USER');
  }

  authEvent(event: string, data?: any): void {
    // Don't log sensitive auth data in production
    const safeData = this.isDevelopment ? data : { userId: data?.userId };
    this.info(`Auth Event: ${event}`, safeData, 'AUTH');
  }

  performance(operation: string, duration: number, data?: any): void {
    this.debug(`Performance: ${operation} took ${duration}ms`, data, 'PERF');
  }
}

export const logger = new Logger();

// Secure logger for sensitive operations
export const secureLogger = {
  user: (message: string, user?: any) => {
    const safeUser = user ? { id: user.id, email: user.email } : undefined;
    logger.info(message, safeUser, 'USER');
  },
  
  auth: (message: string, data?: any) => {
    // Never log tokens or passwords
    const safeData = data ? { ...data, password: '[REDACTED]', token: '[REDACTED]' } : undefined;
    logger.info(message, safeData, 'AUTH');
  },
  
  api: (message: string, data?: any) => {
    // Filter sensitive headers and data
    const safeData = data ? {
      ...data,
      headers: data.headers ? { ...data.headers, Authorization: '[REDACTED]' } : undefined
    } : undefined;
    logger.info(message, safeData, 'API');
  }
};

export default logger; 