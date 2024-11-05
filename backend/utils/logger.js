const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../logs/command.log');

const logCommand = (command, output) => {
  const logEntry = `${new Date().toISOString()} - Command: ${command}, Output: ${output}\n`;
  fs.appendFileSync(logFilePath, logEntry, 'utf8');
};

module.exports = { logCommand };
