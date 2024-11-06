const allowedCommands = ['ls', 'pwd', 'whoami', 'cat'];

exports.isCommandAllowed = (command) => {
  const baseCommand = command.split(' ')[0];
  return allowedCommands.includes(baseCommand);
};
