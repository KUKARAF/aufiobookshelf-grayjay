#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
    echo "No .env file found. Run sign-script.sh first."
    exit 1
fi

# Source the environment variables
source .env

# Update config.json with the public key and signature
sed -i "s|\"scriptSignature\": \".*\"|\"scriptSignature\": \"${PLUGIN_SIGNATURE}\"|" config.json
sed -i "s|\"scriptPublicKey\": \".*\"|\"scriptPublicKey\": \"${PLUGIN_PUBLIC_KEY}\"|" config.json

echo "Updated config.json with new signature and public key"
