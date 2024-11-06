const express = require('express');
const morgan = require('morgan');
const commandRoutes = require('./routes/commandRoutes');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// API routes
app.use('/api/commands', commandRoutes);

module.exports = app;
