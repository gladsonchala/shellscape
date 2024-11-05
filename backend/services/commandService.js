const { execFile } = require('child_process');
const path = require('path');
const allowedCommands = require('../../config/allowedCommands.json');

const executeCommand = (command) => {
  return new Promise((resolve, reject) => {
    if (!allowedCommands.includes(command.split(' ')[0])) {
      return reject(new Error('Command not allowed.'));
    }

    execFile(command, { shell: true }, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message);
      } else {
        resolve(stdout);
      }
    });
  });
};

module.exports = { executeCommand };
