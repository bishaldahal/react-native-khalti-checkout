import { registerWebModule, NativeModule } from 'expo';

import { KhaltiPaymentSdkModuleEvents } from './KhaltiPaymentSdk.types';

class KhaltiPaymentSdkModule extends NativeModule<KhaltiPaymentSdkModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(KhaltiPaymentSdkModule, 'KhaltiPaymentSdkModule');
