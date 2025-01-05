#!/bin/bash

# Update the package list
apt-get update

# Install Puppeteer dependencies
apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libx11-xcb1 \
    libcups2 \
    libxcomposite1 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libxdamage1 \
    libxshmfence1 \
    fonts-liberation \
    libgbm-dev \
    libgtk-3-0 \
    libxinerama1

# Clean up the apt cache to reduce image size
apt-get clean
rm -rf /var/lib/apt/lists/*

# Set Puppeteer cache directory
export PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer

# Install the required Puppeteer browser version
npx puppeteer browsers install chrome

# Verify if the Chrome binary exists
if [ -f "/opt/render/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome" ]; then
    echo "Chrome binary installed successfully."
else
    echo "Chrome binary not found at the expected path."
    exit 1
fi