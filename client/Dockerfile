# Use an official Node.js runtime as a parent image
FROM node:14 as builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Use a new stage to copy the build output
FROM node:14

WORKDIR /app

# Copy the build output from the previous stage
COPY --from=builder /app/build ./build

# Expose the port the app runs on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
