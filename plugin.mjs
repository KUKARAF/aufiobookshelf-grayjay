import fetch from 'node-fetch';

let headers = {};
let baseUrl = "";
let token = null;

const source = {
    version: 1,

    initialize: async function(config) {
        console.log("Starting plugin initialization with config:", {
            serverUrl: config.serverUrl ? "[PROVIDED]" : "[MISSING]",
            username: config.username ? "[PROVIDED]" : "[MISSING]",
            password: config.password ? "[PROVIDED]" : "[MISSING]"
        });
        
        if (!config.serverUrl || !config.username || !config.password) {
            const error = new Error("Please provide server URL, username and password");
            console.error("Initialization failed:", error);
            throw error;
        }

        try {
            // Clean and validate the URL
            baseUrl = config.serverUrl.trim();

            // Convert to lowercase for consistent handling
            baseUrl = baseUrl.toLowerCase();

            // Remove any trailing slashes
            baseUrl = baseUrl.replace(/\/+$/, '');

            // Handle protocol
            if (!baseUrl.startsWith('https://') && !baseUrl.startsWith('http://')) {
                baseUrl = `https://${baseUrl}`;
            }

            console.log("Connecting to server:", baseUrl);

            const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: config.username,
                    password: config.password
                })
            });

            if (!loginResponse.ok) {
                const errorData = await loginResponse.text();
                console.error("Login failed. Status:", loginResponse.status);
                console.error("Response:", errorData);
                throw new Error(`Authentication failed: ${loginResponse.status} - ${errorData}`);
            }

            const authData = await loginResponse.json();
            if (!authData.token) {
                throw new Error("Invalid authentication response - token not found");
            }

            token = authData.token;
            headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Verify authentication
            const testResponse = await fetch(`${baseUrl}/api/libraries`, { headers });
            if (!testResponse.ok) {
                const testError = await testResponse.text();
                console.error("Test request failed:", testError);
                throw new Error(`Authentication verification failed: ${testResponse.status}`);
            }

            return true;
        } catch (error) {
            console.error("Connection error details:", {
                error: error.message,
                stack: error.stack,
                url: baseUrl
            });
            throw new Error(`Connection failed: ${error.message}`);
        }
    },

    getHome: async function() {
        try {
            const librariesResponse = await fetch(`${baseUrl}/api/libraries`, {
                headers: headers
            });

            if (!librariesResponse.ok) {
                throw new Error("Failed to fetch libraries");
            }

            const libraries = await librariesResponse.json();

            // Get items for each library
            const sections = await Promise.all(libraries.map(async (library) => {
                const itemsResponse = await fetch(`${baseUrl}/api/libraries/${library.id}/items?limit=10&sort=recent`, {
                    headers: headers
                });

                if (!itemsResponse.ok) {
                    return {
                        name: library.name,
                        type: "list",
                        isContinuous: true,
                        items: []
                    };
                }

                const items = await itemsResponse.json();
                return {
                    name: library.name,
                    type: "list",
                    isContinuous: true,
                    items: items.results.map(item => ({
                        type: "audio",
                        name: item.media.metadata.title,
                        author: item.media.metadata.author,
                        duration: Math.floor(item.media.duration || 0),
                        thumbnail: item.media.coverPath ? `${baseUrl}${item.media.coverPath}` : null,
                        url: `${baseUrl}/api/items/${item.id}`
                    }))
                };
            }));

            return { sections };
        } catch (error) {
            throw new Error(`Failed to load home: ${error.message}`);
        }
    },

    getSearchCapabilities: function() {
        return {
            types: ["AUDIO"],
            sorts: ["RELEVANCE", "DATE", "NAME"]
        };
    },

    search: async function(query, type, order, filters) {
        try {
            const response = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(query)}&limit=20`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error("Search failed");
            }

            const results = await response.json();

            return {
                items: results.map(item => ({
                    type: "audio",
                    name: item.media.metadata.title,
                    author: item.media.metadata.author,
                    duration: Math.floor(item.media.duration || 0),
                    thumbnail: item.media.coverPath ? `${baseUrl}${item.media.coverPath}` : null,
                    url: `${baseUrl}/api/items/${item.id}`
                }))
            };
        } catch (error) {
            throw new Error(`Search failed: ${error.message}`);
        }
    },

    getChannelCapabilities: function() {
        return {
            types: ["AUDIO"],
            sorts: ["DATE", "NAME"]
        };
    },

    getChannel: async function(url, type, order, filters) {
        try {
            // Extract library ID from URL
            const libraryId = url.split('/').pop();
            const response = await fetch(`${baseUrl}/api/libraries/${libraryId}/items?limit=20&sort=${order === 'DATE' ? 'recent' : 'alpha'}`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error("Failed to fetch library content");
            }

            const data = await response.json();

            return {
                items: data.results.map(item => ({
                    type: "audio",
                    name: item.media.metadata.title,
                    author: item.media.metadata.author,
                    duration: Math.floor(item.media.duration || 0),
                    thumbnail: item.media.coverPath ? `${baseUrl}${item.media.coverPath}` : null,
                    url: `${baseUrl}/api/items/${item.id}`
                }))
            };
        } catch (error) {
            throw new Error(`Failed to load channel: ${error.message}`);
        }
    },

    getPlaylistCapabilities: function() {
        return {
            types: ["AUDIO"],
            sorts: ["DATE", "NAME"]
        };
    },

    getPlaylist: async function(url, type, order, filters) {
        try {
            const response = await fetch(`${baseUrl}/api/playlists/${url}`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error("Failed to fetch playlist");
            }

            const playlist = await response.json();

            return {
                items: playlist.items.map(item => ({
                    type: "audio",
                    name: item.media.metadata.title,
                    author: item.media.metadata.author,
                    duration: Math.floor(item.media.duration || 0),
                    thumbnail: item.media.coverPath ? `${baseUrl}${item.media.coverPath}` : null,
                    url: `${baseUrl}/api/items/${item.id}`
                }))
            };
        } catch (error) {
            throw new Error(`Failed to load playlist: ${error.message}`);
        }
    },

    getVideoDetails: async function(url) {
        try {
            const itemId = url.split('/').pop();
            const response = await fetch(`${baseUrl}/api/items/${itemId}`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error("Failed to fetch audio details");
            }

            const item = await response.json();

            return {
                name: item.media.metadata.title,
                author: item.media.metadata.author,
                duration: Math.floor(item.media.duration || 0),
                thumbnail: item.media.coverPath ? `${baseUrl}${item.media.coverPath}` : null,
                video: {
                    type: "direct",
                    url: `${baseUrl}/api/items/${itemId}/play`
                }
            };
        } catch (error) {
            throw new Error(`Failed to load audio details: ${error.message}`);
        }
    },

    isChannelUrl: function(url) {
        return url.includes("/library/");
    },

    isPlaylistUrl: function(url) {
        return url.includes("/playlist/");
    },

    isVideoUrl: function(url) {
        return url.includes("/items/");
    }
};

const testPlugin = async function() {
    try {
        console.log("Testing plugin functionality...");

        // Check for required test environment variables
        const testServerUrl = process.env.TEST_SERVER_URL;
        const testUsername = process.env.TEST_USERNAME;
        const testPassword = process.env.TEST_PASSWORD;

        if (!testServerUrl || !testUsername || !testPassword) {
            console.error("Missing required test environment variables:");
            if (!testServerUrl) console.error("- TEST_SERVER_URL is missing");
            if (!testUsername) console.error("- TEST_USERNAME is missing");
            if (!testPassword) console.error("- TEST_PASSWORD is missing");
            process.exit(1);
        }

        console.log("Testing with server URL:", testServerUrl.replace(/\/+$/, '')); // Remove trailing slashes for logging

        const testConfig = {
            serverUrl: testServerUrl,
            username: testUsername,
            password: testPassword
        };

        // Test initialize
        console.log("\n1. Testing initialization...");
        await source.initialize(testConfig);
        console.log("✓ Initialize successful");

        // Test home
        console.log("\n2. Testing home endpoint...");
        const home = await source.getHome();
        console.log("✓ GetHome successful");
        console.log("Found libraries:", home.sections.length);

        // Test search
        console.log("\n3. Testing search functionality...");
        const searchResult = await source.search("test", "AUDIO", "RELEVANCE", {});
        console.log("✓ Search successful");

        console.log("\nAll tests completed successfully!");
    } catch (error) {
        console.error("\nTest failed:", error.message);
        console.error("\nDetailed error information:");
        console.error("- Message:", error.message);
        console.error("- Stack:", error.stack);
        if (error.response) {
            console.error("- Response status:", error.response.status);
            console.error("- Response data:", await error.response.text());
        }
        process.exit(1);
    }
};

// Run tests if executed directly
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
    testPlugin();
}

export { source };
