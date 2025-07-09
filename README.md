# @bishaldahal/react-native-khalti-checkout

A comprehensive React Native/Expo SDK for integrating Khalti Payment Gateway into your mobile applications. This SDK provides a seamless way to accept payments from Khalti users, eBanking users, mobile banking users, and card holders in Nepal.

## Features

- ✅ **Easy Integration**: Simple API with TypeScript support
- ✅ **Comprehensive Error Handling**: Detailed error messages and validation
- ✅ **Event-Driven Architecture**: Listen to payment events in real-time
- ✅ **Environment Support**: Both TEST and PROD environments
- ✅ **Input Validation**: Built-in validation for payment parameters
- ✅ **Development Tools**: Debug logging and utilities
- ✅ **Memory Management**: Automatic cleanup of event listeners
- ✅ **Android Support**: Native Android implementation using Khalti's Android SDK
- ✅ **Expo Compatibility**: Works with Expo development builds

## Installation

```bash
# Using npm
npm install @bishaldahal/react-native-khalti-checkout

# Using yarn
yarn add @bishaldahal/react-native-khalti-checkout

# Using pnpm
pnpm add @bishaldahal/react-native-khalti-checkout
```

## Prerequisites

1. **Khalti Merchant Account**: You need a Khalti merchant account to get your API keys
2. **Expo Development Build**: This package requires native code, so Expo Go won't work
3. **Android Device/Emulator**: Currently supports Android only (iOS support coming soon)
4. **Node.js 16+**: Required for development

### Getting Khalti API Keys

- **Sandbox/Test**: Sign up at [test-admin.khalti.com](https://test-admin.khalti.com/#/join/merchant)
- **Production**: Visit [admin.khalti.com](https://admin.khalti.com/)

## Quick Start

### 1. Basic Payment Implementation

```typescript
import KhaltiPaymentSdk from '@bishaldahal/react-native-khalti-checkout';

// Start payment
const handlePayment = async () => {
  try {
    const result = await KhaltiPaymentSdk.startPayment({
      publicKey: 'your_khalti_public_key',
      pidx: 'payment_identifier_from_backend',
      environment: 'TEST' // or 'PROD'
    });
    
    console.log('Payment successful:', result);
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
```

### 2. With Event Listeners

```typescript
import { useEffect } from 'react';
import KhaltiPaymentSdk from '@bishaldahal/react-native-khalti-checkout';

const PaymentScreen = () => {
  useEffect(() => {
    // Subscribe to payment events
    const successSubscription = KhaltiPaymentSdk.onPaymentSuccess((payload) => {
      console.log('Payment successful:', payload);
      // Handle successful payment
    });

    const errorSubscription = KhaltiPaymentSdk.onPaymentError((payload) => {
      console.log('Payment failed:', payload);
      // Handle payment error
    });

    const cancelSubscription = KhaltiPaymentSdk.onPaymentCancel((payload) => {
      console.log('Payment cancelled:', payload);
      // Handle payment cancellation
    });

    // Cleanup subscriptions
    return () => {
      successSubscription.remove();
      errorSubscription.remove();
      cancelSubscription.remove();
    };
  }, []);

  return (
    // Your UI components
  );
};
```

### 3. Using Expo useEvent Hook

```typescript
import { useEvent } from 'expo';
import KhaltiPaymentSdk from '@bishaldahal/react-native-khalti-checkout';

const PaymentComponent = () => {
  const onPaymentSuccess = useEvent(KhaltiPaymentSdk, 'onPaymentSuccess');
  const onPaymentError = useEvent(KhaltiPaymentSdk, 'onPaymentError');
  const onPaymentCancel = useEvent(KhaltiPaymentSdk, 'onPaymentCancel');

  // Handle events
  if (onPaymentSuccess) {
    console.log('Payment successful:', onPaymentSuccess);
  }

  if (onPaymentError) {
    console.log('Payment error:', onPaymentError);
  }

  if (onPaymentCancel) {
    console.log('Payment cancelled');
  }

  // Rest of your component
};
```

## API Reference

### Methods

#### `startPayment(args: PaymentArgs): Promise<PaymentSuccessPayload>`

Initiates the payment process.

**Parameters:**
- `publicKey` (string): Your Khalti public key
- `pidx` (string): Payment identifier from your backend
- `environment` (optional): 'TEST' or 'PROD' (defaults to 'TEST')

**Returns:** Promise that resolves with payment result

#### `closePayment(): Promise<PaymentCloseResponse>`

Closes the current payment session.

#### `getPaymentConfig(): Promise<PaymentConfigResponse>`

Gets the current payment configuration.

### Event Listeners

#### `onPaymentSuccess(listener): Subscription`

Subscribe to successful payment events.

#### `onPaymentError(listener): Subscription`

Subscribe to payment error events.

#### `onPaymentCancel(listener): Subscription`

Subscribe to payment cancellation events.

### Utility Methods

#### `removeAllListeners(): void`

Removes all active event listeners.

#### `isReady(): boolean`

Checks if the SDK is ready for payments.

## Payment Flow

1. **Backend Integration**: Create a payment in your backend using Khalti's API
2. **Get PIDX**: Your backend should return a `pidx` (payment identifier)
3. **Initialize Payment**: Call `startPayment()` with the `pidx`
4. **Handle Events**: Listen to payment events for success/failure
5. **Verify Payment**: Verify payment status in your backend

### Backend Integration Example

```javascript
// Example backend endpoint to create payment
app.post('/create-khalti-payment', async (req, res) => {
  try {
    const response = await fetch('https://a.khalti.com/api/v2/epayment/initiate/', {
      method: 'POST',
      headers: {
        'Authorization': 'key your_secret_key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        return_url: 'https://yoursite.com/payment/success',
        website_url: 'https://yoursite.com',
        amount: req.body.amount, // in paisa
        purchase_order_id: req.body.orderId,
        purchase_order_name: req.body.orderName,
      })
    });

    const data = await response.json();
    res.json({ pidx: data.pidx });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Type Definitions

```typescript
// Payment arguments
interface PaymentArgs {
  publicKey: string;
  pidx: string;
  environment?: 'TEST' | 'PROD';
}

// Success payload
interface PaymentSuccessPayload {
  pidx: string;
  status: 'completed' | 'needs_verification';
  paymentResult?: string;
  message?: string;
  timestamp?: number;
}

// Error payload
interface PaymentErrorPayload {
  error: string;
  status: 'failed';
  details?: string;
  timestamp?: number;
}
```

## Error Handling

The SDK provides comprehensive error handling with specific error codes:

```typescript
import { KhaltiErrorCode } from '@bishaldahal/react-native-khalti-checkout';

try {
  await KhaltiPaymentSdk.startPayment(args);
} catch (error) {
  switch (error.code) {
    case KhaltiErrorCode.NO_ACTIVITY:
      // Handle no activity error
      break;
    case KhaltiErrorCode.PAYMENT_INIT:
      // Handle initialization error
      break;
    case KhaltiErrorCode.INVALID_CONFIG:
      // Handle invalid configuration
      break;
    default:
      // Handle other errors
  }
}
```

## Validation

The SDK includes built-in validation for payment arguments:

```typescript
import { validatePaymentArgs } from '@bishaldahal/react-native-khalti-checkout';

const args = {
  publicKey: 'your_key',
  pidx: 'payment_id',
  environment: 'TEST'
};

const validation = validatePaymentArgs(args);
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}
```

## Testing

### Test Credentials (Sandbox)

- **Test Khalti ID**: 9800000000, 9800000001, 9800000002, 9800000003, 9800000004, 9800000005
- **Test MPIN**: 1111  
- **Test OTP**: 987654

### Sample Test Implementation

```typescript
const testPayment = async () => {
  try {
    const result = await KhaltiPaymentSdk.startPayment({
      publicKey: 'test_public_key_your_test_key',
      pidx: 'test_pidx_from_your_backend',
      environment: 'TEST'
    });
    
    console.log('Test payment result:', result);
  } catch (error) {
    console.error('Test payment failed:', error);
  }
};
```

## Troubleshooting

### Common Issues

1. **"No current activity" error**
   - Ensure you're calling the payment method from a React component that's currently mounted
   - Check that your app has proper Activity context

2. **Build failures**
   - Make sure you're using Expo Development Build, not Expo Go
   - Verify that all dependencies are properly installed

3. **Payment not initiating**
   - Verify your public key is correct
   - Ensure the PIDX is valid and generated from your backend
   - Check network connectivity

### Debug Mode

Enable debug logging in development:

```typescript
// The SDK automatically enables debug logging in development mode
// Check your console for detailed logs starting with [KhaltiSDK]
```

## Security Best Practices

1. **Never expose secret keys**: Only use public keys in your mobile app
2. **Verify payments server-side**: Always verify payment status in your backend
3. **Use HTTPS**: Ensure all API communications use HTTPS
4. **Validate on backend**: Don't rely solely on client-side validation

## Contributing

Contributions are very welcome! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

## Example Application

Check out the [example application](./example) to see the SDK in action. The example demonstrates:

- Environment configuration (Test/Production)
- Advanced payment scenarios
- Error handling implementations
- UI integration patterns

To run the example:

```bash
cd example
npm install
npx expo start
```

## Support

- **Documentation**: [Khalti Developer Docs](https://docs.khalti.com/)
- **Issues**: [GitHub Issues](https://github.com/bishaldahal/react-native-khalti-checkout/issues)
- **Email**: support@khalti.com

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Changelog

### v0.1.0
- Initial release
- Android support with Khalti's native Android SDK
- Basic payment functionality
- Event-driven architecture
- Comprehensive error handling
- TypeScript support
- Input validation and sanitization
- Development debugging tools

## Platform Support

| Platform | Status | Version |
|----------|--------|---------|
| Android  | ✅ Supported | API 21+ |
| iOS      | 🚧 Coming Soon | iOS 12.0+ |
| Web      | 🚧 Planned | Modern Browsers |

---

Made with ❤️ for the Nepalese developer community
