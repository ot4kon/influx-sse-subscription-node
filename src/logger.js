const winston = require("winston");
const config = require("../config");

const { logging, consoleLogs, logFile, errorLogFile } = config.app;

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: logFile })
  ],
  exceptions: [
    new winston.transports.File({ filename: errorLogFile })
  ],
  exitOnError: false,
  silent: !logging
});

// turns on console logs in development environment
if (process.env.NODE_ENV !== "production" && consoleLogs) {
  logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

module.exports = logger;
