#!/bin/bash

# Check if GPG is installed
if ! command -v gpg &> /dev/null; then
    echo "GPG is not installed. Please install it first."
    exit 1
fi

# Read the plugin content
PLUGIN_CONTENT=$(cat plugin.mjs)

# Export public key in ASCII armor format
GPG_PUBLIC_KEY=$(gpg --armor --export)
echo "Public key (copy this to scriptPublicKey in config.json):"
echo "$GPG_PUBLIC_KEY"

# Generate detached signature in base64
SIGNATURE=$(echo -n "$PLUGIN_CONTENT" | gpg --sign --detach-sign --armor | base64 -w 0)
echo -e "\nSignature (copy this to scriptSignature in config.json):"
echo "$SIGNATURE"
