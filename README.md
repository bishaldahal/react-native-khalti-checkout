# React Native Khalti Checkout

<div align="center">

[![npm version](https://badge.fury.io/js/@bishaldahal%2Freact-native-khalti-checkout.svg)](https://badge.fury.io/js/@bishaldahal%2Freact-native-khalti-checkout)
[![npm downloads](https://img.shields.io/npm/dm/@bishaldahal/react-native-khalti-checkout.svg)](https://www.npmjs.com/package/@bishaldahal/react-native-khalti-checkout)
![Platform](https://img.shields.io/badge/platform-android%20%7C%20ios-green.svg)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/bishaldahal/react-native-khalti-checkout/blob/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/bishaldahal/react-native-khalti-checkout/pulls)

**React Native/Expo SDK for Khalti Payment Gateway**

_Accept payments from Khalti wallet, eBanking, mobile banking, and cards in your Expo applications._

[🚀 Quick Start](#-quick-start) • [📖 Usage](#-usage) • [💡 Examples](#-example-app) • [🐛 Issues](https://github.com/bishaldahal/react-native-khalti-checkout/issues)

</div>

## 🚀 Quick Start

Here's how to get Khalti payments working in your Expo app:

### 1. Installation

```bash
npx expo install @bishaldahal/react-native-khalti-checkout
```

### 2. Build Development Client

> **⚠️ Important**: This package requires native code and **does not work with Expo Go**.

```bash
# Create development build
eas build --profile development --platform android

# Or build locally
npx expo run:android
```

### 3. Basic Usage

```typescript
import KhaltiPaymentSdk from "@bishaldahal/react-native-khalti-checkout";

const handlePayment = async () => {
  try {
    const result = await KhaltiPaymentSdk.startPayment({
      publicKey: "your_khalti_public_key",
      pidx: "payment_id_from_backend", // Get this from your server
      environment: "TEST", // Use "PROD" for production
    });
    console.log("Payment successful:", result);
  } catch (error) {
    console.error("Payment failed:", error);
  }
};
```

That's the basic setup. [Jump to detailed setup](#-setup-guide) or [see complete example](#-usage).

## ✨ Features

- **🔧 Expo Compatible** - Fully tested with Expo SDK 52 & 53 (may work with others)
- **🚀 Easy Integration** - Simple API with TypeScript support
- **🔒 Secure & Reliable** - Built-in validation & error handling
- **⚡ Real-time Events** - Listen to payment events instantly
- **🌍 Multi-environment** - TEST and PROD environments
- **📱 Native Performance** - Uses Khalti's official native SDKs
- **💾 Memory Safe** - Automatic cleanup of event listeners

## 📋 Prerequisites

| Item               | Requirement                       | Link                                                                                       |
| ------------------ | --------------------------------- | ------------------------------------------------------------------------------------------ |
| **Platform**       | Expo SDK 52+ / React Native 0.72+ | [Expo Docs](https://docs.expo.dev)                                                         |
| **OS Support**     | Android 5.0+ (API 21) & iOS 15.1+ | -                                                                                          |
| **Node.js**        | Version 16 or higher              | [Download](https://nodejs.org)                                                             |
| **Khalti Account** | Merchant account with API keys    | [Test](https://test-admin.khalti.com/#/join/merchant) \| [Prod](https://admin.khalti.com/) |
| **Development**    | Expo Development Build            | [Guide](#-setup-guide)                                                                     |

### Environment Variables

| Variable            | Description                      | Example                 | Required     |
| ------------------- | -------------------------------- | ----------------------- | ------------ |
| `KHALTI_PUBLIC_KEY` | Public key from Khalti dashboard | `test_public_key_xxxxx` | ✅           |
| `KHALTI_SECRET_KEY` | Secret key (backend only)        | `test_secret_key_xxxxx` | ✅ (Backend) |

## Setup Guide

> **⚠️ Important**: This SDK only works with **Expo Development Builds** (not Expo Go) and is fully tested with **Expo SDK 52 & 53**. Compatible with other versions but not guaranteed.

### For New Projects

```bash
# Create new Expo project with latest SDK
npx create-expo-app@latest MyKhaltiApp --template blank-typescript
cd MyKhaltiApp

# Install Khalti SDK
npx expo install @bishaldahal/react-native-khalti-checkout

# Install development build dependencies
npx expo install expo-dev-client
npm install -g @expo/eas-cli
```

### For Existing Projects

```bash
# Install Khalti SDK
npx expo install @bishaldahal/react-native-khalti-checkout

# Install development build dependencies
npx expo install expo-dev-client
npm install -g @expo/eas-cli
```

### Configure Your Project

**1. Update app.json/app.config.js:**

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "platforms": ["android", "ios"],
    "android": {
      "package": "com.yourcompany.yourapp",
      "versionCode": 1,
      "compileSdkVersion": 34,
      "targetSdkVersion": 34,
      "minSdkVersion": 21
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "plugins": ["expo-dev-client"]
  }
}
```

**2. Create development build:**

```bash
# Setup EAS (first time only)
eas login
eas init

# Build for Android (recommended for testing)
eas build --profile development --platform android

# Install the APK on your device when build completes
```

**3. Start development:**

```bash
# Start development server
npx expo start --dev-client

# Open on your device with the custom development build
```

## Usage

### Complete Payment Implementation

Here's a more complete example with event listeners and error handling:

```typescript
import React, { useEffect, useState } from "react";
import { View, Button, Alert, Text } from "react-native";
import KhaltiPaymentSdk from "@bishaldahal/react-native-khalti-checkout";

export default function PaymentScreen() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set up event listeners
    const successSubscription = KhaltiPaymentSdk.onPaymentSuccess((payload) => {
      console.log("Payment successful:", payload);
      Alert.alert("Success", `Transaction ID: ${payload.txnId}`);
      setLoading(false);
    });

    const errorSubscription = KhaltiPaymentSdk.onPaymentError((payload) => {
      console.log("Payment failed:", payload);
      Alert.alert(
        "Payment Failed",
        payload.error_description || "Unknown error"
      );
      setLoading(false);
    });

    const cancelSubscription = KhaltiPaymentSdk.onPaymentCancel((payload) => {
      console.log("Payment cancelled:", payload);
      Alert.alert("Payment Cancelled", "You cancelled the payment");
      setLoading(false);
    });

    // Cleanup subscriptions
    return () => {
      successSubscription.remove();
      errorSubscription.remove();
      cancelSubscription.remove();
    };
  }, []);

  // WARNING: This should be done from your backend in production
  const createPaymentInBackend = async (amount: number) => {
    // In production, make this API call from your backend server
    const response = await fetch("YOUR_BACKEND_URL/create-khalti-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amount,
        orderId: `order-${Date.now()}`, // Unique order ID from the backend
        customerInfo: {
          name: "John Doe",
          email: "john@example.com",
          phone: "9800000000",
        },
      }),
    });

    const data = await response.json();
    return data.pidx;
  };

  // Alternative: Frontend payment initiation (FOR DEMO/TESTING ONLY)
  const createPaymentFromFrontend = async (amount: number) => {
    try {
      const response = await fetch(
        "https://a.khalti.com/api/v2/epayment/initiate/",
        {
          method: "POST",
          headers: {
            Authorization: "key test_secret_key_your_secret_key_here", // NEVER do this in production
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            return_url: "https://example.com/payment/",
            website_url: "https://example.com/",
            amount: amount * 100, // Convert to paisa
            purchase_order_id: `order-${Date.now()}`,
            purchase_order_name: "Test Product",
            customer_info: {
              name: "John Doe",
              email: "john@example.com",
              phone: "9800000000",
            },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Payment initialization failed");
      }

      return data.pidx;
    } catch (error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Option 1: Get pidx from your backend (RECOMMENDED)
      // const pidx = await createPaymentInBackend(100);

      // Option 2: Frontend initiation (DEMO ONLY - NOT for production)
      const pidx = await createPaymentFromFrontend(100);

      // Start payment with Khalti SDK
      await KhaltiPaymentSdk.startPayment({
        publicKey: "test_public_key_your_key_here",
        pidx: pidx,
        environment: "TEST", // Use "PROD" for production
      });
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error", error.message);
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Khalti Payment Demo
      </Text>

      <Button
        title={loading ? "Processing..." : "Pay NPR 100"}
        onPress={handlePayment}
        disabled={loading}
      />

      <Text
        style={{
          marginTop: 20,
          fontSize: 12,
          color: "gray",
          textAlign: "center",
        }}
      >
        Note: This demo includes frontend payment initiation for testing.{"\n"}
        In production, always create payments from your backend server.
      </Text>
    </View>
  );
}
```

### Configuration Options

```typescript
interface PaymentArgs {
  publicKey: string; // Your Khalti public key
  pidx: string; // Payment identifier from backend
  environment?: "TEST" | "PROD"; // Default: 'TEST'
}
```

### Event Response Types

```typescript
// Success response
interface PaymentSuccessPayload {
  pidx: string;
  txnId: string;
  amount: number;
  mobile: string;
  status: string;
  timestamp: number;
}

// Error response
interface PaymentErrorPayload {
  error_key: string;
  error_description: string;
  timestamp: number;
}

// Cancel response
interface PaymentCancelPayload {
  reason?: string;
  timestamp: number;
}
```

## Testing

### Test Credentials

For testing in the sandbox environment, use these:

| Field         | Value                        | Notes                     |
| ------------- | ---------------------------- | ------------------------- |
| **Khalti ID** | `9800000000` to `9800000005` | Any of these test numbers |
| **MPIN**      | `1111`                       | 4-digit PIN               |
| **OTP**       | `987654`                     | 6-digit verification code |

## Common Issues & Solutions

**"Module not found" error**

You need to rebuild your development client after installing the package:

```bash
# Clear cache and rebuild
npx expo start --clear
eas build --profile development --platform android --clear-cache
```

**Payment not starting**

Check these common issues:

- Verify your public key is correct
- Make sure the PIDX is valid and from your backend
- Check your network connection
- Validate the environment setting (TEST vs PROD)

## Security Best Practices

### ✅ Do This

- Use public keys only in mobile apps
- Create payments from your backend server
- Verify payments server-side
- Use HTTPS for all API communications
- Validate payment status in your backend

### ❌ Don't Do This

- Never put secret keys in mobile apps
- Don't rely only on client-side payment verification
- Don't store sensitive payment data locally

## 📱 Platform Support

| Platform    | Status          | SDK Version | Notes                       |
| ----------- | --------------- | ----------- | --------------------------- |
| **Android** | Fully Supported | API 21+     | Works best for testing      |
| **iOS**     | Fully Supported | iOS 15.1+   | Full native SDK integration |

### Compatibility Matrix

| Expo SDK  | React Native | Node.js | Status              |
| --------- | ------------ | ------- | ------------------- |
| **52-53** | 0.72+        | 16+     | ✅ **Fully Tested** |
| 49-51     | 0.70-0.71    | 16+     | ⚠️ May work         |
| < 49      | < 0.70       | < 16    | ❌ Not supported    |

## 📖 API Reference

### Core Methods

| Method                       | Parameters    | Returns                          | Description                      |
| ---------------------------- | ------------- | -------------------------------- | -------------------------------- |
| `startPayment(args)`         | `PaymentArgs` | `Promise<PaymentSuccessPayload>` | Initiates payment process        |
| `onPaymentSuccess(callback)` | `Function`    | `Subscription`                   | Listen for successful payments   |
| `onPaymentError(callback)`   | `Function`    | `Subscription`                   | Listen for payment errors        |
| `onPaymentCancel(callback)`  | `Function`    | `Subscription`                   | Listen for payment cancellations |
| `closePayment()`             | None          | `Promise<void>`                  | Closes current payment session   |

### Utility Methods

```typescript
// Clean up all event listeners
KhaltiPaymentSdk.removeAllListeners();

// Check if SDK is ready
const isReady = KhaltiPaymentSdk.isReady();
```

## Example App

Check out the [example application](https://github.com/bishaldahal/react-native-khalti-checkout/tree/main/example) for a complete implementation with:

- 🔧 Complete configuration setup
- 💳 Payment flow implementation
- 🚨 Error handling patterns
- 🎨 UI integration examples

### Run the Example

```bash
git clone https://github.com/bishaldahal/react-native-khalti-checkout.git
cd react-native-khalti-checkout/example
npm install
npx expo run:android
```

## 🤝 Contributing

We welcome contributions!

### How to contribute

```bash
# Fork and clone the repository
git clone https://github.com/your-username/react-native-khalti-checkout.git
cd react-native-khalti-checkout
npm install

# Run example app
cd example && npm install && npx expo run:android
```

### Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation when needed
- Test on real devices when possible

See [Contributing Guide](CONTRIBUTING.md) for more details.

## 📞 Support

Need help? Here are your options:

| Resource             | Description          | Link                                                                                          |
| -------------------- | -------------------- | --------------------------------------------------------------------------------------------- |
| 📚 **Documentation** | Official Khalti docs | [docs.khalti.com](https://docs.khalti.com/)                                                   |
| 🐛 **Bug Reports**   | Report issues        | [GitHub Issues](https://github.com/bishaldahal/react-native-khalti-checkout/issues)           |
| 💬 **Discussions**   | Community support    | [GitHub Discussions](https://github.com/bishaldahal/react-native-khalti-checkout/discussions) |
| **Email**            | Direct support       | support@khalti.com                                                                            |

### Links

- [Repository](https://github.com/bishaldahal/react-native-khalti-checkout)
- [NPM Package](https://www.npmjs.com/package/@bishaldahal/react-native-khalti-checkout)
- [License](LICENSE)

If you find this helpful, consider giving it a star on GitHub!

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### 📋 Third-Party Notices

This package uses the official Khalti Android SDK. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for full license information.

---

<div align="center">

### 🇳🇵 Made with ❤️ for the Nepalese Developer Community

**Found this helpful? Give it a ⭐ on GitHub!**

[![GitHub stars](https://img.shields.io/github/stars/bishaldahal/react-native-khalti-checkout?style=social)](https://github.com/bishaldahal/react-native-khalti-checkout/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/bishaldahal/react-native-khalti-checkout?style=social)](https://github.com/bishaldahal/react-native-khalti-checkout/network/members)

_Happy Coding! 🚀_

</div>
