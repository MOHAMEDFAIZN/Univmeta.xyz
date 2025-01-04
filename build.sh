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
