import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import os from 'os';
import { spawn } from 'node-pty';
import winston from 'winston';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Allowed commands whitelist
const ALLOWED_COMMANDS = new Set([
  'ls', 'pwd', 'echo', 'date', 'whoami', 'clear',
  'cat', 'head', 'tail', 'wc', 'sort', 'uniq',
  'mkdir', 'touch', 'rm', 'cp', 'mv'
]);

// Command validation
const isCommandAllowed = (cmd) => {
  const baseCmd = cmd.split(' ')[0];
  return ALLOWED_COMMANDS.has(baseCmd);
};

// Clean terminal output from ANSI escape sequences
const cleanOutput = (data) => {
  // Remove ANSI escape sequences and control characters
  return data
    .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '') // Remove ANSI color codes
    .replace(/\x1B\]0;.*?\x07/g, '') // Remove terminal title sequences
    .replace(/\[(\?)[0-9;]*[a-zA-Z]/g, '') // Remove other control sequences
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/^\s*\n/g, '') // Remove empty lines at start
    .replace(/\n\s*$/g, '') // Remove empty lines at end
    .trim();
};

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  socket.emit('output', 'Connected to terminal server');

  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
  const ptyProcess = spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: { ...process.env, TERM: 'dumb' } // Use dumb terminal to reduce control characters
  });

  socket.on('command', (command) => {
    if (!command || typeof command !== 'string') {
      socket.emit('output', 'Invalid command format');
      return;
    }

    const sanitizedCommand = command.trim();
    
    if (!isCommandAllowed(sanitizedCommand)) {
      socket.emit('output', 'Command not allowed');
      logger.warn(`Blocked command attempt: ${sanitizedCommand}`);
      return;
    }

    try {
      logger.info(`Executing command: ${sanitizedCommand}`);
      ptyProcess.write(`${sanitizedCommand}\n`);
    } catch (error) {
      logger.error('Command execution error:', error);
      socket.emit('output', 'Command execution failed');
    }
  });

  ptyProcess.onData((data) => {
    const cleanedOutput = cleanOutput(data);
    if (cleanedOutput) {
      socket.emit('output', cleanedOutput);
    }
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
    ptyProcess.kill();
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
