# Stage 1: Build Stage.
FROM node:18-alpine AS build

# Set working directory.
WORKDIR /app

# Copy package.json and package-lock.json to the container.
COPY package.json package-lock.json ./

# Install dependencies and browser-sync globally.
RUN npm install && npm install -g browser-sync

# Copy the rest of the application files.
COPY . .

# Stage 2: Development Stage.
FROM alpine:3.21.3

# Install yarn in the final image required to run the application.
RUN apk add --no-cache yarn

# Set working directory.
WORKDIR /app

# Copy only necessary files from the build stage (node_modules and app files).
COPY --from=build /app /app

# Set environment variable.
ENV NODE_ENV=development

# Expose port 3000.
EXPOSE 3000

# Start the application using yarn.
CMD ["yarn", "run", "start:watch"]
