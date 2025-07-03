import { NativeModule, requireNativeModule } from 'expo';

import { KhaltiPaymentSdkModuleEvents } from './KhaltiPaymentSdk.types';

declare class KhaltiPaymentSdkModule extends NativeModule<KhaltiPaymentSdkModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<KhaltiPaymentSdkModule>('KhaltiPaymentSdk');
