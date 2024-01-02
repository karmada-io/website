FROM node:18-alpine

# Set working directory
WORKDIR /app/docs

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy current directory to the container
COPY . .

# Set environment variable
ENV NODE_ENV=development

# Install browser-sync globally
RUN npm install -g browser-sync

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:watch"]
