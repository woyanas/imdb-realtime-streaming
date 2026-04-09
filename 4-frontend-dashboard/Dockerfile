FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 5173

# Start the development server (bind to 0.0.0.0 for container access)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]