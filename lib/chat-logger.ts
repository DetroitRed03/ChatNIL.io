/**
 * Comprehensive Chat Logging System
 *
 * Production-grade logging utility for debugging and monitoring chat functionality.
 * Provides structured logging with context, log levels, and filtering.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogCategory =
  | 'chat'
  | 'sync'
  | 'persistence'
  | 'api'
  | 'user'
  | 'ui'
  | 'performance'
  | 'error';

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  userId?: string;
  chatId?: string;
  sessionId?: string;
}

interface ChatLoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  categories: LogCategory[];
  maxEntries: number;
  persistToLocalStorage: boolean;
}

class ChatLogger {
  private config: ChatLoggerConfig;
  private logs: LogEntry[] = [];
  private readonly LOG_STORAGE_KEY = 'chatnil-logs-v1';

  // Log level hierarchy for filtering
  private readonly LEVEL_PRIORITY: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  // Emoji icons for console output
  private readonly LEVEL_ICONS: Record<LogLevel, string> = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌'
  };

  private readonly CATEGORY_ICONS: Record<LogCategory, string> = {
    chat: '💬',
    sync: '🔄',
    persistence: '💾',
    api: '📡',
    user: '👤',
    ui: '🎨',
    performance: '⚡',
    error: '🚨'
  };

  constructor(config?: Partial<ChatLoggerConfig>) {
    // Default configuration
    this.config = {
      enabled: typeof window !== 'undefined' &&
               (process.env.NODE_ENV === 'development' ||
                localStorage.getItem('chatnil-debug') === 'true'),
      minLevel: 'debug',
      categories: ['chat', 'sync', 'persistence', 'api', 'user', 'ui', 'performance', 'error'],
      maxEntries: 1000,
      persistToLocalStorage: false,
      ...config
    };

    // Load persisted logs if enabled
    if (this.config.persistToLocalStorage && typeof window !== 'undefined') {
      this.loadLogs();
    }
  }

  /**
   * Enable debug mode (e.g., from browser console)
   */
  enableDebug() {
    this.config.enabled = true;
    this.config.minLevel = 'debug';
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatnil-debug', 'true');
    }
    this.info('performance', 'Debug mode enabled');
  }

  /**
   * Disable debug mode
   */
  disableDebug() {
    this.config.enabled = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatnil-debug');
    }
  }

  /**
   * Check if a log should be recorded based on level and category
   */
  private shouldLog(level: LogLevel, category: LogCategory): boolean {
    if (!this.config.enabled) return false;
    if (!this.config.categories.includes(category)) return false;
    return this.LEVEL_PRIORITY[level] >= this.LEVEL_PRIORITY[this.config.minLevel];
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: any,
    context?: { userId?: string; chatId?: string; sessionId?: string }
  ) {
    if (!this.shouldLog(level, category)) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      data,
      userId: context?.userId,
      chatId: context?.chatId,
      sessionId: context?.sessionId
    };

    // Add to in-memory logs (with rotation)
    this.logs.push(entry);
    if (this.logs.length > this.config.maxEntries) {
      this.logs.shift(); // Remove oldest entry
    }

    // Persist to localStorage if enabled
    if (this.config.persistToLocalStorage) {
      this.persistLogs();
    }

    // Console output with formatting
    this.outputToConsole(entry);
  }

  /**
   * Format and output log entry to console
   */
  private outputToConsole(entry: LogEntry) {
    const levelIcon = this.LEVEL_ICONS[entry.level];
    const categoryIcon = this.CATEGORY_ICONS[entry.category];
    const timestamp = entry.timestamp.toISOString().substring(11, 23); // HH:mm:ss.SSS

    const prefix = `${levelIcon} ${categoryIcon} [${entry.category.toUpperCase()}] [${timestamp}]`;
    const message = `${prefix} ${entry.message}`;

    // Use appropriate console method
    const consoleMethod = entry.level === 'error' ? console.error :
                         entry.level === 'warn' ? console.warn :
                         entry.level === 'info' ? console.info :
                         console.log;

    if (entry.data !== undefined) {
      consoleMethod(message, entry.data);
    } else {
      consoleMethod(message);
    }

    // Add context if available
    if (entry.userId || entry.chatId || entry.sessionId) {
      const context: any = {};
      if (entry.userId) context.userId = entry.userId;
      if (entry.chatId) context.chatId = entry.chatId;
      if (entry.sessionId) context.sessionId = entry.sessionId;
      console.log('  Context:', context);
    }
  }

  /**
   * Public logging methods
   */
  debug(category: LogCategory, message: string, data?: any, context?: { userId?: string; chatId?: string; sessionId?: string }) {
    this.log('debug', category, message, data, context);
  }

  info(category: LogCategory, message: string, data?: any, context?: { userId?: string; chatId?: string; sessionId?: string }) {
    this.log('info', category, message, data, context);
  }

  warn(category: LogCategory, message: string, data?: any, context?: { userId?: string; chatId?: string; sessionId?: string }) {
    this.log('warn', category, message, data, context);
  }

  error(category: LogCategory, message: string, data?: any, context?: { userId?: string; chatId?: string; sessionId?: string }) {
    this.log('error', category, message, data, context);
  }

  /**
   * Measure and log performance
   */
  measure(category: LogCategory, operation: string, fn: () => any) {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    this.info('performance', `${operation} completed in ${duration.toFixed(2)}ms`, {
      operation,
      duration,
      category
    });

    return result;
  }

  /**
   * Measure and log async performance
   */
  async measureAsync<T>(category: LogCategory, operation: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;

      this.info('performance', `${operation} completed in ${duration.toFixed(2)}ms`, {
        operation,
        duration,
        category,
        status: 'success'
      });

      return result;
    } catch (error) {
      const duration = performance.now() - start;

      this.error('performance', `${operation} failed after ${duration.toFixed(2)}ms`, {
        operation,
        duration,
        category,
        status: 'error',
        error
      });

      throw error;
    }
  }

  /**
   * Get all logs (for debugging UI)
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Filter logs by criteria
   */
  filterLogs(filters: {
    level?: LogLevel;
    category?: LogCategory;
    userId?: string;
    chatId?: string;
    since?: Date;
  }): LogEntry[] {
    return this.logs.filter(entry => {
      if (filters.level && entry.level !== filters.level) return false;
      if (filters.category && entry.category !== filters.category) return false;
      if (filters.userId && entry.userId !== filters.userId) return false;
      if (filters.chatId && entry.chatId !== filters.chatId) return false;
      if (filters.since && entry.timestamp < filters.since) return false;
      return true;
    });
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      config: this.config,
      logs: this.logs
    }, null, 2);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    if (this.config.persistToLocalStorage && typeof window !== 'undefined') {
      localStorage.removeItem(this.LOG_STORAGE_KEY);
    }
    this.info('performance', 'Logs cleared');
  }

  /**
   * Persist logs to localStorage
   */
  private persistLogs() {
    if (typeof window === 'undefined') return;

    try {
      // Only persist recent logs to avoid localStorage quota issues
      const recentLogs = this.logs.slice(-100);
      localStorage.setItem(this.LOG_STORAGE_KEY, JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Failed to persist logs:', error);
    }
  }

  /**
   * Load logs from localStorage
   */
  private loadLogs() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.LOG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.logs = parsed.map(entry => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  }

  /**
   * Get log statistics
   */
  getStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<LogCategory, number>;
  } {
    const stats = {
      total: this.logs.length,
      byLevel: { debug: 0, info: 0, warn: 0, error: 0 } as Record<LogLevel, number>,
      byCategory: {
        chat: 0,
        sync: 0,
        persistence: 0,
        api: 0,
        user: 0,
        ui: 0,
        performance: 0,
        error: 0
      } as Record<LogCategory, number>
    };

    this.logs.forEach(entry => {
      stats.byLevel[entry.level]++;
      stats.byCategory[entry.category]++;
    });

    return stats;
  }
}

// Export singleton instance
export const chatLogger = new ChatLogger();

// Make available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).chatLogger = chatLogger;
}

// Helper functions for quick access
export const logChat = (message: string, data?: any, context?: { userId?: string; chatId?: string }) =>
  chatLogger.info('chat', message, data, context);

export const logSync = (message: string, data?: any, context?: { userId?: string; chatId?: string }) =>
  chatLogger.info('sync', message, data, context);

export const logPersistence = (message: string, data?: any, context?: { userId?: string; chatId?: string }) =>
  chatLogger.info('persistence', message, data, context);

export const logAPI = (message: string, data?: any, context?: { userId?: string }) =>
  chatLogger.info('api', message, data, context);

export const logUser = (message: string, data?: any, context?: { userId?: string }) =>
  chatLogger.info('user', message, data, context);

export const logError = (message: string, error?: any, context?: { userId?: string; chatId?: string }) =>
  chatLogger.error('error', message, error, context);

export const logPerformance = (message: string, data?: any) =>
  chatLogger.info('performance', message, data);
