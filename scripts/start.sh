#!/bin/bash
echo "Starting backend..."
(cd backend && npm ci && npm run start) &
echo "Starting frontend..."
(cd frontend && npm ci && npm run start)
