/* Tiny levelled logger — no external dependency. */
const stamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
const write = (level, args) => {
  const line = `[${stamp()}] ${level.toUpperCase()}`;
  if (level === 'error') console.error(line, ...args);
  else if (level === 'warn') console.warn(line, ...args);
  else console.log(line, ...args);
};

const logger = {
  info: (...args) => write('info', args),
  warn: (...args) => write('warn', args),
  error: (...args) => write('error', args),
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') write('debug', args);
  },
};

export default logger;
