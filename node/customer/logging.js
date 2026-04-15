
const fs = require('fs');
const logFile = 'app.log';

/**
 * Logs a message to the log file.
 * @param {string} message - The message to log.
 */
function logEvent(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;

  fs.appendFile(logFile, logMessage, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
}

module.exports = { logEvent };
