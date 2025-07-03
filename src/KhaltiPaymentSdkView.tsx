import { requireNativeView } from 'expo';
import * as React from 'react';

import { KhaltiPaymentSdkViewProps } from './KhaltiPaymentSdk.types';

const NativeView: React.ComponentType<KhaltiPaymentSdkViewProps> =
  requireNativeView('KhaltiPaymentSdk');

export default function KhaltiPaymentSdkView(props: KhaltiPaymentSdkViewProps) {
  return <NativeView {...props} />;
}
