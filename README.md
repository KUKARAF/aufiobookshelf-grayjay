# Grayjay Audiobookshelf Plugin

A plugin for [Grayjay](https://grayjay.app/) that enables seamless integration with your [Audiobookshelf](https://www.audiobookshelf.org/) server. Stream your audiobooks directly from your self-hosted Audiobookshelf server through Grayjay.

## Features

- Connect to your personal Audiobookshelf server
- Browse your audiobook libraries
- Search functionality
- Direct streaming support
- Playlist management
- Secure authentication

## Installation

### Option 1: Download Latest Release
1. Go to the [Releases](../releases) page
2. Download the latest `grayjay-audiobookshelf-plugin.zip`
3. In Grayjay:
   - Go to Settings
   - Select Sources
   - Click "Add Source"
   - Select the downloaded ZIP file

### Option 2: Manual Installation
1. Download these files:
   - `plugin.mjs`
   - `config.json`
   - `translations.json`
2. Create a ZIP file containing these three files
3. Follow steps 3-4 from Option 1

## Configuration

After installation, you'll need to configure the plugin with your server details:

1. **Server URL**: Your Audiobookshelf server address (e.g., `https://books.example.com`)
2. **Username**: Your Audiobookshelf username
3. **Password**: Your Audiobookshelf password

## Troubleshooting

Common issues and solutions:

1. **Connection Failed**
   - Verify your server URL is correct and includes the protocol (http:// or https://)
   - Ensure your server is accessible from your device
   - Check if your server requires HTTPS

2. **Authentication Failed**
   - Double-check your username and password
   - Verify your user account has the necessary permissions

3. **Content Not Loading**
   - Confirm your libraries are properly configured in Audiobookshelf
   - Check your server's network connectivity

## Development

### Building from Source
1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `node --experimental-modules plugin.mjs`

### Creating a Release
The project supports both GitHub Actions and GitLab CI/CD for automated releases.

#### Using GitHub:
1. Tag your commit: `git tag v1.0.0`
2. Push with tags: `git push origin --tags`
3. GitHub Actions will automatically:
   - Run tests
   - Create a release ZIP file
   - Create a GitHub release
   - Upload the ZIP as a release asset

#### Using GitLab:
1. Tag your commit: `git tag v1.0.0`
2. Push with tags: `git push --tags`
3. The GitLab CI/CD pipeline will automatically:
   - Run tests
   - Create a release ZIP file
   - Create a GitLab release
   - Upload the ZIP as a release asset

## Resources

- [Audiobookshelf Documentation](https://api.audiobookshelf.org/)
- [Grayjay Plugin Development Guide](https://github.com/TheDcoder/Grayjay/blob/master/plugin-development.md)
- [Audiobookshelf GitHub](https://github.com/advplyr/audiobookshelf)

## Support

For issues related to:
- Plugin functionality: Open an issue in this repository
- Audiobookshelf server: Visit the [Audiobookshelf GitHub](https://github.com/advplyr/audiobookshelf)
- Grayjay app: Visit the [Grayjay support channels](https://grayjay.app/support)

## License

This plugin is open-source and available under the MIT License.