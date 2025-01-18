const isDevelopment = process.env.NODE_ENV === 'development';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const formatMessage = (level: LogLevel, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    debug: '🔍'
  }[level];

  return `${emoji} [${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}`;
};

export const logger = {
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(formatMessage('info', message, data));
    }
  },
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(formatMessage('warn', message, data));
    }
  },
  error: (message: string, data?: any) => {
    // Always log errors, even in production
    console.error(formatMessage('error', message, data));
  },
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(formatMessage('debug', message, data));
    }
  }
};