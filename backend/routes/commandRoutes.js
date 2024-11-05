const express = require('express');
const { runCommand } = require('../controllers/commandController');
const router = express.Router();

router.post('/run', runCommand);

module.exports = router;
