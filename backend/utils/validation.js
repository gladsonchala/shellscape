const sanitizeInput = (input) => {
  // Remove any potential shell injection characters.
  return input.replace(/[;&|]/g, '');
};

module.exports = { sanitizeInput };
