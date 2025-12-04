export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, any>;
  source?: string;
  userId?: string;
  sessionId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  enablePerformanceTracking: boolean;
}

class Logger {
  private config: LoggerConfig;
  private logHistory: LogEntry[] = [];
  private sessionId: string;
  private performanceMarks: Map<string, number> = new Map();

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
      enableConsole: true,
      enableStorage: process.env.NODE_ENV === 'development',
      maxStorageEntries: 1000,
      enablePerformanceTracking: process.env.NODE_ENV === 'development',
      ...config
    };

    this.sessionId = this.generateSessionId();

    if (typeof window !== 'undefined' && this.config.enableStorage) {
      this.loadStoredLogs();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    source?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      metadata,
      source,
      sessionId: this.sessionId,
      userId: this.getCurrentUserId()
    };
  }

  private getCurrentUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;

    try {
      const user = localStorage.getItem('supabase.auth.token');
      if (user) {
        const parsed = JSON.parse(user);
        return parsed?.user?.id;
      }
    } catch (error) {
      // Ignore localStorage errors
    }
    return undefined;
  }

  private formatConsoleOutput(entry: LogEntry): void {
    const levelColors: Record<number, string> = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m'  // Red
    };

    const levelNames: Record<number, string> = {
      [LogLevel.DEBUG]: 'DEBUG',
      [LogLevel.INFO]: 'INFO',
      [LogLevel.WARN]: 'WARN',
      [LogLevel.ERROR]: 'ERROR'
    };

    const reset = '\x1b[0m';
    const color = levelColors[entry.level] || '';
    const levelName = levelNames[entry.level] || 'LOG';

    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const contextStr = entry.context ? ` [${entry.context}]` : '';
    const sourceStr = entry.source ? ` (${entry.source})` : '';

    const prefix = `${color}[${timestamp}] ${levelName}${reset}${contextStr}${sourceStr}:`;

    const consoleMethod = entry.level >= LogLevel.ERROR ? 'error' :
                         entry.level >= LogLevel.WARN ? 'warn' :
                         entry.level >= LogLevel.INFO ? 'info' : 'log';

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      console[consoleMethod](prefix, entry.message, entry.metadata);
    } else {
      console[consoleMethod](prefix, entry.message);
    }
  }

  private storeLog(entry: LogEntry): void {
    if (!this.config.enableStorage || typeof window === 'undefined') return;

    this.logHistory.push(entry);

    // Maintain max entries limit
    if (this.logHistory.length > this.config.maxStorageEntries) {
      this.logHistory = this.logHistory.slice(-this.config.maxStorageEntries);
    }

    try {
      localStorage.setItem('chatnil_logs', JSON.stringify(this.logHistory));
    } catch (error) {
      // If storage fails, clear old logs and try again
      try {
        this.logHistory = this.logHistory.slice(-100);
        localStorage.setItem('chatnil_logs', JSON.stringify(this.logHistory));
      } catch (retryError) {
        // Ignore storage errors in production
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to store logs:', retryError);
        }
      }
    }
  }

  private loadStoredLogs(): void {
    try {
      const stored = localStorage.getItem('chatnil_logs');
      if (stored) {
        this.logHistory = JSON.parse(stored);
      }
    } catch (error) {
      this.logHistory = [];
    }
  }

  private log(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>, source?: string): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context, metadata, source);

    if (this.config.enableConsole) {
      this.formatConsoleOutput(entry);
    }

    if (this.config.enableStorage) {
      this.storeLog(entry);
    }
  }

  debug(message: string, context?: string, metadata?: Record<string, any>, source?: string): void {
    this.log(LogLevel.DEBUG, message, context, metadata, source);
  }

  info(message: string, context?: string, metadata?: Record<string, any>, source?: string): void {
    this.log(LogLevel.INFO, message, context, metadata, source);
  }

  warn(message: string, context?: string, metadata?: Record<string, any>, source?: string): void {
    this.log(LogLevel.WARN, message, context, metadata, source);
  }

  error(message: string, context?: string, metadata?: Record<string, any>, source?: string): void {
    this.log(LogLevel.ERROR, message, context, metadata, source);
  }

  // Performance tracking methods
  startTiming(label: string): void {
    if (!this.config.enablePerformanceTracking) return;
    this.performanceMarks.set(label, performance.now());
    this.debug(`Started timing: ${label}`, 'performance');
  }

  endTiming(label: string): number | null {
    if (!this.config.enablePerformanceTracking) return null;

    const startTime = this.performanceMarks.get(label);
    if (startTime === undefined) {
      this.warn(`No start time found for: ${label}`, 'performance');
      return null;
    }

    const duration = performance.now() - startTime;
    this.performanceMarks.delete(label);

    this.info(`Timing completed: ${label}`, 'performance', {
      duration: `${duration.toFixed(2)}ms`,
      durationMs: duration
    });

    return duration;
  }

  // Utility methods
  getLogs(filter?: { level?: LogLevel; context?: string; source?: string; limit?: number }): LogEntry[] {
    let filtered = [...this.logHistory];

    if (filter?.level !== undefined) {
      filtered = filtered.filter(entry => entry.level >= filter.level!);
    }

    if (filter?.context) {
      filtered = filtered.filter(entry => entry.context === filter.context);
    }

    if (filter?.source) {
      filtered = filtered.filter(entry => entry.source === filter.source);
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  clearLogs(): void {
    this.logHistory = [];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('chatnil_logs');
      } catch (error) {
        // Ignore storage errors
      }
    }
  }

  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Context helpers
  withContext(context: string) {
    return {
      debug: (message: string, metadata?: Record<string, any>, source?: string) =>
        this.debug(message, context, metadata, source),
      info: (message: string, metadata?: Record<string, any>, source?: string) =>
        this.info(message, context, metadata, source),
      warn: (message: string, metadata?: Record<string, any>, source?: string) =>
        this.warn(message, context, metadata, source),
      error: (message: string, metadata?: Record<string, any>, source?: string) =>
        this.error(message, context, metadata, source)
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export factory for custom loggers
export const createLogger = (config: Partial<LoggerConfig> = {}) => new Logger(config);

// Backward compatibility helpers
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger)
};