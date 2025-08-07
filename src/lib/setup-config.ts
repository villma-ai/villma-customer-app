import { configLoader } from './config-loader';

// Setup configuration for different environments
export async function setupConfiguration() {
  const environment = process.env.NODE_ENV || 'development';
  
  console.log(`Setting up configuration for environment: ${environment}`);
  
  try {
    await configLoader.loadConfig(environment as 'development' | 'staging' | 'production');
    console.log('Configuration loaded successfully');
  } catch (error) {
    console.error('Failed to load configuration:', error);
  }
}

// Example usage for different deployment scenarios:

// 1. For Docker/Kubernetes deployments
export async function setupDockerConfig() {
  // In Docker, environment variables are set at runtime
  await configLoader.loadFromEnvironment();
}

// 2. For serverless deployments (Vercel, Netlify, etc.)
export async function setupServerlessConfig() {
  // In serverless, environment variables are set at build time
  // but can be overridden at runtime through the API
  await configLoader.loadFromEnvironment();
}

// 3. For traditional server deployments
export async function setupServerConfig() {
  // In traditional servers, you might load from a config file
  const configPath = process.env.CONFIG_FILE_PATH || './config.json';
  await configLoader.loadFromFile(configPath);
}

// 4. For external configuration management (AWS Parameter Store, etc.)
export async function setupExternalConfig() {
  const configApiUrl = process.env.CONFIG_API_URL;
  if (configApiUrl) {
    await configLoader.loadFromAPI(configApiUrl);
  } else {
    await configLoader.loadFromEnvironment();
  }
}
