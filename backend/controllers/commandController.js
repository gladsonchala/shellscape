const { executeCommand } = require('../services/commandService');

exports.runCommand = async (req, res) => {
  const { command } = req.body;

  try {
    const output = await executeCommand(command);
    res.status(200).json({ success: true, output });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
