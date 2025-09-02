import {
  PaymentArgs,
  ValidationResult,
  KhaltiEnvironment,
} from "./KhaltiPaymentSdk.types";

/**
 * Validates payment arguments before processing
 * @param args Payment arguments to validate
 * @returns Validation result with errors if any
 */
export function validatePaymentArgs(args: PaymentArgs): ValidationResult {
  const errors: string[] = [];

  // Validate public key
  if (!args.publicKey || typeof args.publicKey !== "string") {
    errors.push("Public key is required and must be a string");
  } else if (args.publicKey.trim().length < 10) {
    errors.push("Public key must be at least 10 characters long");
  }
  // else if (!args.publicKey.startsWith('live_') && !args.publicKey.startsWith('test_')) {
  //   errors.push('Public key must start with "live_" or "test_"');
  // }

  // Validate PIDX
  if (!args.pidx || typeof args.pidx !== "string") {
    errors.push("PIDX is required and must be a string");
  } else if (args.pidx.trim().length < 5) {
    errors.push("PIDX must be at least 5 characters long");
  }

  // Validate environment
  if (args.environment && !["TEST", "PROD"].includes(args.environment)) {
    errors.push('Environment must be either "TEST" or "PROD"');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Determines the appropriate environment based on public key
 * @param publicKey Khalti public key
 * @returns Suggested environment
 */
export function getEnvironmentFromPublicKey(
  publicKey: string,
): KhaltiEnvironment {
  return publicKey.startsWith("live_") ? "PROD" : "TEST";
}

/**
 * Sanitizes payment arguments by trimming whitespace and setting defaults
 * @param args Raw payment arguments
 * @returns Sanitized payment arguments
 */
export function sanitizePaymentArgs(args: PaymentArgs): PaymentArgs {
  return {
    publicKey: args.publicKey?.trim() || "",
    pidx: args.pidx?.trim() || "",
    environment:
      args.environment ||
      getEnvironmentFromPublicKey(args.publicKey?.trim() || ""),
  };
}

/**
 * Creates a user-friendly error message from validation errors
 * @param errors Array of validation error messages
 * @returns Formatted error message
 */
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) return "";
  if (errors.length === 1) return errors[0];

  return `Multiple validation errors:\n${errors.map((error, index) => `${index + 1}. ${error}`).join("\n")}`;
}

/**
 * Checks if the current environment supports Khalti payments
 * This is useful for testing and development
 */
export function isKhaltiSupported(): boolean {
  // Khalti primarily supports Nepal
  // In a real implementation, you might check device locale or other factors
  return true;
}

/**
 * Generates a unique identifier for payment tracking
 * @returns Unique tracking ID
 */
export function generateTrackingId(): string {
  return `khalti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formats amount for display (converts paisa to rupees)
 * @param amountInPaisa Amount in paisa (smallest currency unit)
 * @returns Formatted amount string
 */
export function formatAmount(amountInPaisa: number): string {
  const rupees = amountInPaisa / 100;
  return `Rs. ${rupees.toFixed(2)}`;
}

/**
 * Converts rupees to paisa
 * @param rupees Amount in rupees
 * @returns Amount in paisa
 */
export function rupeesToPaisa(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Checks if the SDK is running in development mode
 * @returns True if in development mode
 */
export function isDevelopmentMode(): boolean {
  return __DEV__;
}
