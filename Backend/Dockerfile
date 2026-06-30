# Backend Dockerfile (dev mode with hot reload)
FROM node:20-alpine

WORKDIR /app

# bcrypt is a native module and needs build tools to compile on Alpine
RUN apk add --no-cache python3 make g++

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm install

# Copy rest of the source
COPY . .

EXPOSE 9005

# Polling is needed for nodemon to detect changes from a host-mounted volume,
# especially on Windows/WSL or Docker Desktop on Mac
ENV CHOKIDAR_USEPOLLING=true

# Use your dev script (nodemon). Change "server.js" port below if yours differs.
CMD ["npm", "run", "dev"]