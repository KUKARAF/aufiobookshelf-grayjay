#!/bin/bash

# Get the Git signing key
GIT_SIGNING_KEY=$(git config --get user.signingkey)

if [ -z "$GIT_SIGNING_KEY" ]; then
    echo "No Git signing key found. Please configure your signing key:"
    echo "git config --global user.signingkey <your-key>"
    exit 1
fi

# Read the plugin content
PLUGIN_CONTENT=$(cat plugin.mjs)

# Export the public key used for Git commit signing
PUBLIC_KEY=$(gpg --armor --export ${GIT_SIGNING_KEY})

# Generate signature using the same key used for Git commits
SIGNATURE=$(echo -n "$PLUGIN_CONTENT" | gpg --sign --detach-sign --armor --default-key ${GIT_SIGNING_KEY} | base64 -w 0)

# Create or update environment variables for CI/CD
echo "PLUGIN_PUBLIC_KEY=${PUBLIC_KEY}" > .env
echo "PLUGIN_SIGNATURE=${SIGNATURE}" >> .env

echo "Environment variables written to .env file"
echo "Use these in your CI/CD pipeline to update config.json"
