#!/bin/bash
echo "Starting backend..."
(cd backend && npm install && npm run start) &
echo "Starting frontend..."
(cd frontend && npm install && npm run start)
