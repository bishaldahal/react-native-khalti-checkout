/**
 * Constants for Khalti Payment SDK Example App
 *
 * This file contains all the constants, validation rules, and configuration
 * values used throughout the example application.
 */

// Payment configuration constants
export const PAYMENT_LIMITS = {
  MIN_AMOUNT: 1, // 1 paisa
  MAX_AMOUNT: 100000000, // 1 million NPR in paisa
  MIN_ORDER_ID_LENGTH: 3,
  MIN_ORDER_NAME_LENGTH: 2,
} as const;

// Validation regex patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NEPAL_MOBILE: /^9[6-9]\d{8}$/, // Nepal mobile number format
  URL: /^https?:\/\/.+/,
} as const;

// Default form values
export const DEFAULT_FORM_VALUES = {
  AMOUNT: "1000",
  ORDER_NAME: "Test Product",
  CUSTOMER_NAME: "John Doe",
  CUSTOMER_EMAIL: "john@example.com",
  CUSTOMER_PHONE: "9800000000",
} as const;

// UI constants
export const UI_CONSTANTS = {
  SCROLL_TO_TOP_DURATION: 300,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
} as const;

// Color scheme
export const COLORS = {
  PRIMARY: "#5C2D91",
  SECONDARY: "#6c757d",
  SUCCESS: "#28a745",
  ERROR: "#dc3545",
  WARNING: "#ffc107",
  INFO: "#17a2b8",
  LIGHT: "#f8f9fa",
  DARK: "#1a1a1a",
  WHITE: "#ffffff",
  BORDER: "#dee2e6",
  BACKGROUND: "#f8f9fa",
  TEXT_PRIMARY: "#1a1a1a",
  TEXT_SECONDARY: "#6c757d",
  TEXT_MUTED: "#adb5bd",
} as const;

// Status messages
export const STATUS_MESSAGES = {
  READY: "Ready to test payments",
  VALIDATING: "🔄 Validating payment details...",
  CALLING_API: "🌐 Calling Khalti API to initiate payment...",
  OPENING_SDK: "📱 Opening Khalti payment interface...",
  PAYMENT_WINDOW_OPENED:
    "⏳ Payment window opened. Complete payment in the Khalti interface.",
  READY_FOR_NEXT: "Ready for next payment",
  READY_TO_RETRY: "Ready to retry payment",
  READY_FOR_NEW: "Ready for new payment",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  VALIDATION_FAILED: "Validation failed",
  AMOUNT_REQUIRED: "Amount is required",
  AMOUNT_INVALID: `Please enter a valid amount between ${PAYMENT_LIMITS.MIN_AMOUNT} and ${PAYMENT_LIMITS.MAX_AMOUNT.toLocaleString()} paisa`,
  ORDER_ID_REQUIRED: "Order ID is required",
  ORDER_ID_TOO_SHORT: `Order ID must be at least ${PAYMENT_LIMITS.MIN_ORDER_ID_LENGTH} characters long`,
  ORDER_NAME_REQUIRED: "Order name is required",
  ORDER_NAME_TOO_SHORT: `Order name must be at least ${PAYMENT_LIMITS.MIN_ORDER_NAME_LENGTH} characters long`,
  EMAIL_INVALID: "Please enter a valid email address",
  PHONE_INVALID: "Please enter a valid Nepal mobile number (9XXXXXXXX)",
  SECRET_KEY_REQUIRED:
    "Secret key is required. Please configure your Khalti credentials.",
  UNEXPECTED_ERROR: "An unexpected error occurred",
} as const;

// Info messages
export const INFO_MESSAGES = {
  AMOUNT_INFO: `100 paisa = 1 NPR • Max: ${(PAYMENT_LIMITS.MAX_AMOUNT / 100).toLocaleString()} NPR`,
  ORDER_ID_INFO: "Unique identifier for this order",
  ORDER_NAME_INFO: "Description of what the customer is purchasing",
  PHONE_INFO: "Nepal mobile number format: 9XXXXXXXX",
  PRODUCTION_WARNING:
    "⚠️ In production, API calls should be made from your secure backend server",
} as const;

// Alert titles and messages
export const ALERTS = {
  PAYMENT_SUCCESS: "Payment Success",
  PAYMENT_ERROR: "Payment Error",
  PAYMENT_CANCELLED: "Payment Cancelled",
  PRODUCTION_MODE: "Production Mode",
  PRODUCTION_MODE_MESSAGE:
    "Please configure your production keys before switching to production mode.",
} as const;

// Accessibility labels
export const ACCESSIBILITY_LABELS = {
  TOGGLE_TEST_MODE: "Toggle test mode",
  SHOW_ADVANCED_CONFIG: "Show advanced configuration",
  HIDE_ADVANCED_CONFIG: "Hide advanced configuration",
  RESET_FORM: "Reset form to default values",
  START_PAYMENT_VALID: "Start payment process",
  START_PAYMENT_INVALID: "Fix form errors to enable payment",
} as const;

// Animation and timing constants
export const TIMING = {
  QUICK: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Platform specific constants
export const PLATFORM_CONFIG = {
  IOS_MIN_VERSION: "12.0",
  ANDROID_MIN_API: "21",
  WEB_SUPPORT: "Modern JavaScript support required",
} as const;
