import { PaymentArgs } from './KhaltiPaymentSdk.types';

export default {
  async startPayment(args: PaymentArgs): Promise<any> {
    console.warn('Khalti Payment SDK is not supported on web platform');
    throw new Error('Khalti Payment SDK is not supported on web platform');
  },
  addListener: () => {
    // No-op for web
  },
  removeAllListeners: () => {
    // No-op for web
  },
};
