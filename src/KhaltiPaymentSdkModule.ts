import { NativeModule, requireNativeModule } from 'expo';

import { KhaltiPaymentSdkModuleEvents, PaymentArgs } from './KhaltiPaymentSdk.types';

declare class KhaltiPaymentSdkModule extends NativeModule<KhaltiPaymentSdkModuleEvents> {
  startPayment(args: PaymentArgs): Promise<any>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<KhaltiPaymentSdkModule>('KhaltiPaymentSdk');
