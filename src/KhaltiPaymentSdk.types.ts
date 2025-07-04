import type { StyleProp, ViewStyle } from 'react-native';

export type PaymentArgs = {
  publicKey: string;
  productId: string;
  productName: string;
  amount: number;
  productUrl?: string;
  additionalData?: Record<string, any>;
};

export type PaymentSuccessPayload = {
  [key: string]: any;
};

export type PaymentErrorPayload = {
  action: string;
  errorMap: Record<string, string>;
};

export type KhaltiPaymentSdkModuleEvents = {
  onPaymentSuccess: (params: PaymentSuccessPayload) => void;
  onPaymentError: (params: PaymentErrorPayload) => void;
  onPaymentCancel: () => void;
};

export type OnLoadEventPayload = {
  url: string;
};

export type ChangeEventPayload = {
  value: string;
};

export type KhaltiPaymentSdkViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
