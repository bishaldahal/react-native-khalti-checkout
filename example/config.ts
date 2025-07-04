// Types
type KhaltiEnvironment = "TEST" | "PROD";

// Configuration interface
export interface KhaltiConfig {
  publicKey: string;
  secretKey: string;
  environment: KhaltiEnvironment;
  returnUrl: string;
  websiteUrl: string;
}

// Default test configuration (safe to commit)
export const DEFAULT_TEST_CONFIG: KhaltiConfig = {
  publicKey: "b9288a8a24c144e389d012ce992eea58",
  secretKey: "8472e5a3a43541e6ba54e623d17f8c95", 
  environment: "TEST",
  returnUrl: "https://example.com/payment/",
  websiteUrl: "https://example.com",
};

// Default production configuration template
export const DEFAULT_PROD_CONFIG: KhaltiConfig = {
  publicKey: "", // Add your production public key
  secretKey: "", // Add your production secret key  
  environment: "PROD",
  returnUrl: "https://yourwebsite.com/payment/",
  websiteUrl: "https://yourwebsite.com",
};

/**
 * Load configuration from local config file or environment variables
 * In production, consider loading from secure environment variables
 */
export const loadConfig = (environment: KhaltiEnvironment): KhaltiConfig => {
  try {
    // Try to load from local config file
    const config = require('./config.json');
    
    if (environment === "TEST") {
      return config.development || DEFAULT_TEST_CONFIG;
    } else {
      return config.production || DEFAULT_PROD_CONFIG;
    }
  } catch (error) {
    // Fallback to default configs if config.json doesn't exist
    console.log("Using default configuration. Create config.json for custom settings.");
    return environment === "TEST" ? DEFAULT_TEST_CONFIG : DEFAULT_PROD_CONFIG;
  }
};

/**
 * Validate configuration before use
 */
export const validateConfig = (config: KhaltiConfig): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.publicKey || config.publicKey.trim() === "") {
    errors.push("Public key is required");
  }

  if (!config.secretKey || config.secretKey.trim() === "") {
    errors.push("Secret key is required");
  }

  if (!config.returnUrl || !isValidUrl(config.returnUrl)) {
    errors.push("Valid return URL is required");
  }

  if (!config.websiteUrl || !isValidUrl(config.websiteUrl)) {
    errors.push("Valid website URL is required");
  }

  if (config.environment === "PROD" && config.publicKey.includes("test_")) {
    errors.push("Cannot use test keys in production environment");
  }

  if (config.environment === "TEST" && config.publicKey.includes("live_")) {
    errors.push("Cannot use production keys in test environment");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Simple URL validation
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get environment-specific API base URL
 */
export const getKhaltiApiUrl = (environment: KhaltiEnvironment): string => {
  return environment === "TEST" 
    ? "https://a.khalti.com/api/v2/epayment/initiate/"
    : "https://khalti.com/api/v2/epayment/initiate/";
};
