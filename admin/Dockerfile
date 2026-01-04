FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the port (admin runs on 5174 to avoid conflict with frontend)
EXPOSE 5174

# Start the app
# Use --host to expose to the network and --port to specify the port
CMD ["npm", "run", "dev", "--", "--host", "--port", "5174"]
