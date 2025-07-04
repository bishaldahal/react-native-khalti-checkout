import { NativeModule, requireNativeModule } from "expo";

import {
  KhaltiPaymentSdkModuleEvents,
  PaymentArgs,
  PaymentSuccessPayload,
  PaymentConfigResponse,
  PaymentCloseResponse,
} from "./KhaltiPaymentSdk.types";

/**
 * Native module interface for Khalti Payment SDK
 */
declare class KhaltiPaymentSdkModule extends NativeModule<KhaltiPaymentSdkModuleEvents> {
  /**
   * Initialize and start payment process
   * @param args Payment configuration arguments
   * @returns Promise that resolves with payment result
   */
  startPayment(args: PaymentArgs): Promise<PaymentSuccessPayload>;

  /**
   * Close the current payment session
   * @returns Promise that resolves when payment is closed
   */
  closePayment(): Promise<PaymentCloseResponse>;

  /**
   * Get the current payment configuration
   * @returns Promise that resolves with current config or null
   */
  getPaymentConfig(): Promise<PaymentConfigResponse>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<KhaltiPaymentSdkModule>("KhaltiPaymentSdk");
