FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Build the frontend
RUN cd frontend && npm install && npm run build

# Run the backend
CMD ["node", "backend/server.js"]
