# Use node as base image
FROM node:20-alpine

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

RUN npm run build

# Expose the application port
EXPOSE 80

# Run the application
CMD ["node", "/usr/src/app/dist/index.js"]