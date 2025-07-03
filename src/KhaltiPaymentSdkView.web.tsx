import * as React from 'react';

import { KhaltiPaymentSdkViewProps } from './KhaltiPaymentSdk.types';

export default function KhaltiPaymentSdkView(props: KhaltiPaymentSdkViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
