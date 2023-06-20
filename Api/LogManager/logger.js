const winston = require('winston');

// Configure the logger
const logger = winston.createLogger({
  level: 'info', // Set the log level
  format: winston.format.json(), // Use JSON format for logs
  transports: [
    new winston.transports.File({ filename: 'logs.log' }) // Specify the log file name
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'exceptions.log' }) // Specify the exception file name
  ],
});

// Create a stream for Winston to handle console output
logger.stream = {
  write: function (message) {
    logger.info(message.trim());
  }
};

  
module.exports = { logger };
