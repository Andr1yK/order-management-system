# Base image
FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Expose port
EXPOSE 4040

# Command to run migrations and start the app
CMD ["npm", "run", "start"]
