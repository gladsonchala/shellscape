const exec = require('child_process').exec;
const { isCommandAllowed } = require('../utils/commandUtils');

exports.runCommand = (req, res) => {
  const { command } = req.body;

  if (!isCommandAllowed(command)) {
    return res.status(400).json({ error: 'Command not allowed' });
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr });
    }
    res.status(200).json({ output: stdout });
  });
};
