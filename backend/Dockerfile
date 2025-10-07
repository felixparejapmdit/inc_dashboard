# Backend Dockerfile
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Install required tools: MySQL client, ping, ldap-utils, netcat
RUN apt-get update && apt-get install -y \
    default-mysql-client \
    iputils-ping \
    ldap-utils \
    netcat-traditional \
 && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json first (better caching)
COPY package*.json ./

# Install dependencies with peer-deps fix
RUN npm install --legacy-peer-deps

# Copy backend source code and the entrypoint script
COPY . .

# Ensure entrypoint is executable
RUN chmod +x ./entrypoint.sh

# This entrypoint will run our wait script
ENTRYPOINT ["./entrypoint.sh"]
