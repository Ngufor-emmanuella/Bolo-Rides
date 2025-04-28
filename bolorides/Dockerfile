FROM node:23.11.0-alpine

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Copy specific configuration if needed
COPY next.config.mjs ./next.config.mjs
COPY public ./public
COPY src/app ./app

# Build the application
RUN npm run build

# Start the application
CMD ["npm", "start"]