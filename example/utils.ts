/**
 * Utility functions for Khalti Payment SDK Example App
 *
 * This file contains reusable utility functions for validation,
 * formatting, and other common operations.
 */

import { VALIDATION_PATTERNS, PAYMENT_LIMITS } from "./constants";

/**
 * Validates email address format
 */
export const validateEmail = (email: string): boolean => {
  return VALIDATION_PATTERNS.EMAIL.test(email);
};

/**
 * Validates Nepal mobile phone number format
 */
export const validatePhone = (phone: string): boolean => {
  return VALIDATION_PATTERNS.NEPAL_MOBILE.test(phone);
};

/**
 * Validates payment amount
 */
export const validateAmount = (amount: string): boolean => {
  const numAmount = parseInt(amount, 10);
  return (
    !isNaN(numAmount) &&
    numAmount >= PAYMENT_LIMITS.MIN_AMOUNT &&
    numAmount <= PAYMENT_LIMITS.MAX_AMOUNT
  );
};

/**
 * Validates URL format
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Generates a unique order ID with timestamp and random suffix
 */
export const generateOrderId = (): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).slice(2, 11);
  return `ORDER_${timestamp}_${randomSuffix}`;
};

/**
 * Converts paisa to NPR with proper formatting
 */
export const paisaToNPR = (paisa: number | string): number => {
  const numPaisa = typeof paisa === "string" ? parseInt(paisa, 10) : paisa;
  return isNaN(numPaisa) ? 0 : numPaisa / 100;
};

/**
 * Formats NPR amount for display
 */
export const formatNPR = (amount: number): string => {
  return amount.toFixed(2);
};

/**
 * Formats paisa amount for display with commas
 */
export const formatPaisa = (paisa: number | string): string => {
  const numPaisa = typeof paisa === "string" ? parseInt(paisa, 10) : paisa;
  return isNaN(numPaisa) ? "0" : numPaisa.toLocaleString();
};

/**
 * Sanitizes string input by trimming whitespace
 */
export const sanitizeString = (input: string): string => {
  return input.trim();
};

/**
 * Checks if a string is empty or only whitespace
 */
export const isEmpty = (str: string): boolean => {
  return !str || str.trim().length === 0;
};

/**
 * Debounce function to limit the rate of function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Gets current timestamp in ISO format
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Formats timestamp for display
 */
export const formatTimestamp = (timestamp?: number): string => {
  const date = timestamp ? new Date(timestamp) : new Date();
  return date.toLocaleString();
};

/**
 * Creates a safe object copy (deep clone for simple objects)
 */
export const safeClone = <T>(obj: T): T => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
};

/**
 * Safely parses JSON string
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
};

/**
 * Masks sensitive data for logging (shows only first and last 4 characters)
 */
export const maskSensitiveData = (
  data: string,
  visibleChars: number = 4
): string => {
  if (data.length <= visibleChars * 2) {
    return "*".repeat(data.length);
  }

  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const middle = "*".repeat(data.length - visibleChars * 2);

  return `${start}${middle}${end}`;
};

/**
 * Validates required fields in an object
 */
export const validateRequiredFields = <T extends Record<string, any>>(
  obj: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];

  requiredFields.forEach((field) => {
    const value = obj[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && isEmpty(value))
    ) {
      missingFields.push(String(field));
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Creates a delay promise for async operations
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Capitalizes the first letter of a string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncates text to specified length with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

/**
 * Checks if the app is running in development mode
 */
export const isDevelopment = (): boolean => {
  return __DEV__;
};
