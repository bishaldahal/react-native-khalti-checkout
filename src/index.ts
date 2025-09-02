import KhaltiPaymentSdkModule from "./KhaltiPaymentSdkModule";
import {
  PaymentArgs,
  PaymentSuccessPayload,
  PaymentErrorPayload,
  PaymentCancelPayload,
  PaymentConfigResponse,
  PaymentCloseResponse,
  KhaltiEventSubscription,
  //   KhaltiErrorCode,
} from "./KhaltiPaymentSdk.types";
import {
  validatePaymentArgs,
  sanitizePaymentArgs,
  formatValidationErrors,
  generateTrackingId,
  isDevelopmentMode,
} from "./utils";

/**
 * Khalti Payment SDK for React Native/Expo
 *
 * This SDK provides a simple interface to integrate Khalti Payment Gateway
 * into React Native applications using Expo.
 *
 * @example
 * ```typescript
 * import KhaltiPaymentSdk from 'khalti-payment-sdk';
 *
 * // Start payment
 * const result = await KhaltiPaymentSdk.startPayment({
 *   publicKey: 'your_public_key',
 *   pidx: 'payment_identifier',
 *   environment: 'TEST'
 * });
 * ```
 */
class KhaltiPaymentSDK {
  private static instance: KhaltiPaymentSDK;
  private subscriptions: KhaltiEventSubscription[] = [];

  /**
   * Get singleton instance of the SDK
   */
  static getInstance(): KhaltiPaymentSDK {
    if (!KhaltiPaymentSDK.instance) {
      KhaltiPaymentSDK.instance = new KhaltiPaymentSDK();
    }
    return KhaltiPaymentSDK.instance;
  }

  /**
   * Initialize and start payment process with validation
   *
   * @param args Payment configuration arguments
   * @returns Promise that resolves with payment result
   * @throws Error if validation fails
   */
  async startPayment(args: PaymentArgs): Promise<PaymentSuccessPayload> {
    const trackingId = generateTrackingId();

    if (isDevelopmentMode()) {
      console.log(
        `[KhaltiSDK] Starting payment with tracking ID: ${trackingId}`,
        args
      );
    }

    try {
      // Sanitize and validate input
      const sanitizedArgs = sanitizePaymentArgs(args);
      const validation = validatePaymentArgs(sanitizedArgs);

      if (!validation.isValid) {
        const errorMessage = formatValidationErrors(validation.errors);
        throw new Error(`Payment validation failed: ${errorMessage}`);
      }

      // Start payment with validated arguments
      const result = await KhaltiPaymentSdkModule.startPayment(sanitizedArgs);

      if (isDevelopmentMode()) {
        console.log(`[KhaltiSDK] Payment completed successfully:`, result);
      }

      return result;
    } catch (error) {
      if (isDevelopmentMode()) {
        console.error(`[KhaltiSDK] Payment failed:`, error);
      }

      // Re-throw with additional context
      throw new Error(
        `Khalti payment failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Close the current payment session
   *
   * @returns Promise that resolves when payment is closed
   */
  async closePayment(): Promise<PaymentCloseResponse> {
    try {
      const result = await KhaltiPaymentSdkModule.closePayment();

      if (isDevelopmentMode()) {
        console.log(`[KhaltiSDK] Payment session closed:`, result);
      }

      return result;
    } catch (error) {
      if (isDevelopmentMode()) {
        console.error(`[KhaltiSDK] Failed to close payment:`, error);
      }
      throw error;
    }
  }

  /**
   * Get the current payment configuration
   *
   * @returns Promise that resolves with current config or null
   */
  async getPaymentConfig(): Promise<PaymentConfigResponse> {
    try {
      return await KhaltiPaymentSdkModule.getPaymentConfig();
    } catch (error) {
      if (isDevelopmentMode()) {
        console.error(`[KhaltiSDK] Failed to get payment config:`, error);
      }
      throw error;
    }
  }

  /**
   * Subscribe to payment success events
   *
   * @param listener Callback function for payment success
   * @returns Subscription object that can be used to unsubscribe
   */
  onPaymentSuccess(
    listener: (payload: PaymentSuccessPayload) => void
  ): KhaltiEventSubscription {
    const subscription = KhaltiPaymentSdkModule.addListener(
      "onPaymentSuccess",
      listener
    );
    this.subscriptions.push(subscription);
    return subscription;
  }

  /**
   * Subscribe to payment error events
   *
   * @param listener Callback function for payment errors
   * @returns Subscription object that can be used to unsubscribe
   */
  onPaymentError(
    listener: (payload: PaymentErrorPayload) => void
  ): KhaltiEventSubscription {
    const subscription = KhaltiPaymentSdkModule.addListener(
      "onPaymentError",
      listener
    );
    this.subscriptions.push(subscription);
    return subscription;
  }

  /**
   * Subscribe to payment cancel events
   *
   * @param listener Callback function for payment cancellation
   * @returns Subscription object that can be used to unsubscribe
   */
  onPaymentCancel(
    listener: (payload?: PaymentCancelPayload) => void
  ): KhaltiEventSubscription {
    const subscription = KhaltiPaymentSdkModule.addListener(
      "onPaymentCancel",
      listener
    );
    this.subscriptions.push(subscription);
    return subscription;
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    this.subscriptions.forEach((subscription) => subscription.remove());
    this.subscriptions = [];
  }

  /**
   * Check if the SDK is ready for payments
   */
  isReady(): boolean {
    return typeof KhaltiPaymentSdkModule !== "undefined";
  }
}

// Export singleton instance
const KhaltiPaymentSdk = KhaltiPaymentSDK.getInstance();

// Export types for convenience
export type {
  PaymentArgs,
  PaymentSuccessPayload,
  PaymentErrorPayload,
  PaymentCancelPayload,
  PaymentConfigResponse,
  PaymentCloseResponse,
} from "./KhaltiPaymentSdk.types";

export { KhaltiErrorCode } from "./KhaltiPaymentSdk.types";
export * from "./utils";

export default KhaltiPaymentSdk;
