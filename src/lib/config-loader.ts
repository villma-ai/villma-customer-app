import { updateRuntimeConfig, getRuntimeConfig } from './runtime-config';

// Configuration loader for different environments
export class ConfigLoader {
  private static instance: ConfigLoader;
  private configLoaded = false;

  private constructor() {}

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  // Load configuration from environment variables
  async loadFromEnvironment() {
    if (this.configLoaded) return;

    // Use the centralized runtime config instead of duplicating environment variable reading
    const config = getRuntimeConfig();
    updateRuntimeConfig(config);
    this.configLoaded = true;
  }

  // Load configuration from external API
  async loadFromAPI(apiUrl: string) {
    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const config = await response.json();
        updateRuntimeConfig(config);
        this.configLoaded = true;
      }
    } catch (error) {
      console.error('Failed to load config from API:', error);
      // Fallback to environment variables
      await this.loadFromEnvironment();
    }
  }

  // Load configuration from configuration file (for server-side)
  async loadFromFile(filePath: string) {
    try {
      if (typeof window === 'undefined') {
        const fs = await import('fs');
        const configData = fs.readFileSync(filePath, 'utf8');
        const config = JSON.parse(configData);
        updateRuntimeConfig(config);
        this.configLoaded = true;
      }
    } catch (error) {
      console.error('Failed to load config from file:', error);
      // Fallback to environment variables
      await this.loadFromEnvironment();
    }
  }

  // Load configuration based on environment
  async loadConfig(environment: 'development' | 'staging' | 'production' = 'development') {
    switch (environment) {
      case 'production':
        // In production, you might load from a secure API or environment variables
        await this.loadFromEnvironment();
        break;
      case 'staging':
        // In staging, you might load from a staging API
        await this.loadFromEnvironment();
        break;
      case 'development':
      default:
        // In development, load from environment variables
        await this.loadFromEnvironment();
        break;
    }
  }
}

// Export singleton instance
export const configLoader = ConfigLoader.getInstance();
