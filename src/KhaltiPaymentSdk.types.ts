export type PaymentArgs = {
  publicKey: string;
  pidx: string;
  environment?: "TEST" | "PROD";
};

export type PaymentSuccessPayload = {
  pidx: string;
  status: string;
  paymentResult?: string;
  message?: string;
};

export type PaymentErrorPayload = {
  error: string;
  status: string;
  event?: string;
};

export type KhaltiPaymentSdkModuleEvents = {
  onPaymentSuccess: (params: PaymentSuccessPayload) => void;
  onPaymentError: (params: PaymentErrorPayload) => void;
  onPaymentCancel: () => void;
};
