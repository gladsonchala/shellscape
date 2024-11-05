const express = require('express');
const commandRoutes = require('./routes/commandRoutes');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/commands', commandRoutes);

module.exports = app;
