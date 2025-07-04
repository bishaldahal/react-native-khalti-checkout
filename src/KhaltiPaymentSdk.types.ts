/**
 * Environment types for Khalti payment
 */
export type KhaltiEnvironment = "TEST" | "PROD";

/**
 * Payment status types
 */
export type PaymentStatus =
  | "completed"
  | "needs_verification"
  | "failed"
  | "cancelled";

/**
 * Payment arguments for initializing Khalti payment
 */
export type PaymentArgs = {
  /** Khalti merchant public key */
  publicKey: string;
  /** Payment identifier obtained from payment initiation API */
  pidx: string;
  /** Payment environment - defaults to 'TEST' */
  environment?: KhaltiEnvironment;
};

/**
 * Successful payment response payload
 */
export type PaymentSuccessPayload = {
  /** Payment identifier */
  pidx: string;
  /** Payment status */
  status: PaymentStatus;
  /** Raw payment result from Khalti SDK */
  paymentResult?: string;
  /** Additional message if any */
  message?: string;
  /** Timestamp of the payment */
  timestamp?: number;
};

/**
 * Payment error response payload
 */
export type PaymentErrorPayload = {
  /** Error message */
  error: string;
  /** Payment status */
  status: PaymentStatus;
  /** Additional error details */
  details?: string;
  /** Timestamp of the error */
  timestamp?: number;
};

/**
 * Payment cancellation payload
 */
export type PaymentCancelPayload = {
  /** Reason for cancellation */
  reason?: string;
  /** Timestamp of cancellation */
  timestamp?: number;
};

/**
 * Payment configuration response
 */
export type PaymentConfigResponse = {
  /** Khalti public key */
  publicKey: string;
  /** Payment identifier */
  pidx: string;
  /** Current environment */
  environment: string;
} | null;

/**
 * Payment close response
 */
export type PaymentCloseResponse = {
  /** Status of close operation */
  status: "closed";
};

/**
 * Event handlers for Khalti Payment SDK
 */
export type KhaltiPaymentSdkModuleEvents = {
  /** Called when payment is successful or needs verification */
  onPaymentSuccess: (payload: PaymentSuccessPayload) => void;
  /** Called when payment fails */
  onPaymentError: (payload: PaymentErrorPayload) => void;
  /** Called when payment is cancelled by user */
  onPaymentCancel: (payload?: PaymentCancelPayload) => void;
};

/**
 * Common error codes used by the SDK
 */
export enum KhaltiErrorCode {
  NO_ACTIVITY = "ERR_NO_ACTIVITY",
  PAYMENT_INIT = "ERR_PAYMENT_INIT",
  PAYMENT_FAILED = "ERR_PAYMENT_FAILED",
  PAYMENT_CANCELED = "ERR_PAYMENT_CANCELED",
  INVALID_CONFIG = "ERR_INVALID_CONFIG",
  CLOSE_PAYMENT = "ERR_CLOSE_PAYMENT",
  GET_CONFIG = "ERR_GET_CONFIG",
}

/**
 * Validation result for payment arguments
 */
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};
