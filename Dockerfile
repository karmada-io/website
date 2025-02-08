FROM node:18-alpine

# Set working directory
WORKDIR /app/docs

# Copy current directory to the container
COPY . .

# Install dependencies
RUN npm install

# Set environment variable
ENV NODE_ENV=development

# Install browser-sync globally
RUN npm install -g browser-sync

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["yarn", "run", "start:watch"]
