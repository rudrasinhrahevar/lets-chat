const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const timestamp = () => new Date().toISOString();

const logger = {
  info: (msg, ...args) => console.log(`${colors.cyan}[INFO]${colors.reset} ${timestamp()} ${msg}`, ...args),
  success: (msg, ...args) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${timestamp()} ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`${colors.yellow}[WARN]${colors.reset} ${timestamp()} ${msg}`, ...args),
  error: (msg, ...args) => console.error(`${colors.red}[ERROR]${colors.reset} ${timestamp()} ${msg}`, ...args),
  debug: (msg, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${colors.blue}[DEBUG]${colors.reset} ${timestamp()} ${msg}`, ...args);
    }
  }
};

export default logger;
