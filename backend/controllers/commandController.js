const { execFile } = require('child_process');
const { isCommandAllowed } = require('../utils/commandUtils');
const { sanitizeInput } = require('../utils/validation');

exports.runCommand = (req, res) => {
  let { command } = req.body;
  command = sanitizeInput(command);

  if (!isCommandAllowed(command)) {
    return res.status(400).json({ error: 'Command not allowed' });
  }

  execFile(command.split(' ')[0], command.split(' ').slice(1), (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr || error.message });
    }
    res.status(200).json({ output: stdout });
  });
};
