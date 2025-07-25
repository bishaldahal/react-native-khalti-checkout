# React Native Khalti Checkout

<div align="center">

[![npm version](https://badge.fury.io/js/@bishaldahal%2Freact-native-khalti-checkout.svg)](https://badge.fury.io/js/@bishaldahal%2Freact-native-khalti-checkout)
[![npm downloads](https://img.shields.io/npm/dm/@bishaldahal/react-native-khalti-checkout.svg)](https://www.npmjs.com/package/@bishaldahal/react-native-khalti-checkout)
[![Platform](https://img.shields.io/badge/platform-android%20%7C%20ios-green.svg)](https://github.com/bishaldahal/react-native-khalti-checkout)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

**🇳🇵 The most comprehensive React Native/Expo SDK for Khalti Payment Gateway**

_Accept payments from Khalti wallet, eBanking, mobile banking, and cards seamlessly in your React Native and Expo applications._

[📚 Documentation](#-api-reference) • [🚀 Quick Start](#-quick-start) • [💡 Examples](#-example-app) • [🐛 Issues](https://github.com/bishaldahal/react-native-khalti-checkout/issues)

</div>

## ✨ Features

<div align="center">

|    🚀 Easy Integration     |         🔒 Secure & Reliable         |        ⚡ Real-time Events         |
| :------------------------: | :----------------------------------: | :--------------------------------: |
| Simple API with TypeScript | Built-in validation & error handling | Listen to payment events instantly |

|    🌍 Multi-environment    |       📱 Native Performance        |      🔧 Expo Compatible       |
| :------------------------: | :--------------------------------: | :---------------------------: |
| TEST and PROD environments | Uses Khalti's official Android SDK | Works with development builds |

</div>

- **Production Ready** - Used by apps in production
- **Memory Safe** - Automatic cleanup of event listeners
- **Developer Friendly** - Comprehensive documentation & examples
- **Well Tested** - Extensive testing with real payment scenarios

## 📦 Installation

```bash
npm install @bishaldahal/react-native-khalti-checkout
```

<details>
<summary>Other package managers</summary>

```bash
# Yarn
yarn add @bishaldahal/react-native-khalti-checkout

# pnpm
pnpm add @bishaldahal/react-native-khalti-checkout

# Bun
bun add @bishaldahal/react-native-khalti-checkout
```

</details>

### 📱 Platform-Specific Setup

The SDK works out of the box with Expo development builds. For iOS, ensure you have:

- **iOS 15.1+** minimum deployment target
- **CocoaPods** installed (`sudo gem install cocoapods`)
- **Xcode 14+** for building

For pure React Native projects:

```bash
# iOS setup (run from project root)
cd ios && pod install

```

## 📋 Prerequisites

> **⚠️ Important**: This package requires native code and **does not work with Expo Go**. You need an [Expo Development Build](#-expo-setup-tutorial) or bare React Native app.

### Requirements

| Requirement           | Details                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| 📱 **Platform**       | Android 5.0+ (API 21+) & iOS 15.1+                                                               |
| 🔑 **Khalti Account** | [Test](https://test-admin.khalti.com/#/join/merchant) \| [Production](https://admin.khalti.com/) |
| ⚛️ **Node.js**        | Version 16 or higher                                                                             |
| 🛠️ **Development**    | Expo Development Build OR React Native CLI                                                       |

### Getting Started Checklist

- Android device/emulator ready
- Khalti merchant account created
- API keys obtained (public key for client)
- Expo development build configured (if using Expo)

## 🏗️ Expo Setup Tutorial

Since this package requires native code, you need to create a **custom development build**. Follow this step-by-step guide:

### Step 1: Create or Configure Your Expo Project

<details>
<summary><strong>For new projects</strong></summary>

```bash
# Create new Expo project
npx create-expo-app MyKhaltiApp --template

# Navigate to project
cd MyKhaltiApp

# Install the Khalti package
npm install @bishaldahal/react-native-khalti-checkout
```

</details>

<details>
<summary><strong>For existing projects</strong></summary>

```bash
# In your existing Expo project
npm install @bishaldahal/react-native-khalti-checkout
```

</details>

### Step 2: Configure app.json/app.config.js

Add the following configuration to your `app.json`:

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
    "plugins": ["expo-build-properties"]
  }
}
```

> **💡 Tip**: Replace `com.yourcompany.yourapp` with your actual package name in reverse domain notation.

### Step 3: Install Development Build Dependencies

```bash
# Install EAS CLI globally
npm install -g @expo/eas-cli

# Login to your Expo account
eas login

# Install development build dependencies
npx expo install expo-dev-client

# Configure EAS
eas init
```

### Step 4: Configure EAS Build

Create or update `eas.json`:

```json
{
  "cli": {
    "version": ">= 0.52.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      },
      "ios": {
        "simulator": false
      }
    }
  }
}
```

### Step 5: Build Custom Development Client

```bash
# Build development client for Android
eas build --profile development --platform android

# Build development client for iOS
eas build --profile development --platform ios

# Wait for build to complete (5-15 minutes)
# Download and install the APK/IPA on your device/emulator
```

### Step 6: Start Development Server

```bash
# Start the Expo dev server
npx expo start --dev-client

# Scan QR code with your custom dev client app
# Or press 'a' to open on Android emulator
```

### Step 7: Test the Integration

Create a test component to verify everything works:

```typescript
// App.tsx or your component
import React from "react";
import { View, Button, Alert, StyleSheet } from "react-native";
import KhaltiPaymentSdk from "@bishaldahal/react-native-khalti-checkout";

export default function App() {
  const testPayment = async () => {
    try {
      // Replace with your actual test credentials
      const result = await KhaltiPaymentSdk.startPayment({
        publicKey: "test_public_key_your_test_key",
        pidx: "test_pidx_from_backend",
        environment: "TEST",
      });
      Alert.alert("Success! 🎉", "Payment completed successfully");
      console.log("Payment result:", result);
    } catch (error) {
      Alert.alert("Error ❌", error.message || "Payment failed");
      console.error("Payment error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="🔥 Test Khalti Payment"
        onPress={testPayment}
        color="#5C2D91"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
});
```

> **💡 Pro Tip**: Replace the test credentials with actual values from your Khalti dashboard for real testing.

### 🎯 Alternative: Local Development Build

If you prefer building locally:

```bash
# Install Android development dependencies
npx expo run:android

# This will:
# 1. Build the development client locally
# 2. Install it on connected device/emulator
# 3. Start the dev server
```

### ⚠️ Important Notes

- **Expo Go won't work** - You must use custom development build
- **First build takes time** - Subsequent builds are faster
- **Android device recommended** - iOS support coming soon
- **Test on real device** - Payment flows work best on physical devices

### 🔧 Troubleshooting Setup

<details>
<summary><strong>Build fails with "SDK not found"</strong></summary>

Make sure you have:

- Android Studio installed
- Android SDK configured
- `ANDROID_HOME` environment variable set
</details>

<details>
<summary><strong>"Module not found" error</strong></summary>

- Rebuild your development client after adding new native dependencies
- Clear Metro cache: `npx expo start --clear`
</details>

<details>
<summary><strong>EAS Build issues</strong></summary>

- Check your `app.json` configuration
- Ensure proper package names and bundle identifiers
- Review build logs in EAS dashboard
</details>

## 🚀 Quick Start

> **💡 Already have Expo setup?** Jump to [Basic Payment](#basic-payment). Need setup help? Check [Expo Setup Tutorial](#-expo-setup-tutorial).

### Basic Payment

```typescript
import KhaltiPaymentSdk from "@bishaldahal/react-native-khalti-checkout";

const handlePayment = async () => {
  try {
    const result = await KhaltiPaymentSdk.startPayment({
      publicKey: "your_khalti_public_key",
      pidx: "payment_identifier_from_backend", // Get this from your server
      environment: "TEST", // Use "PROD" for production
    });

    console.log("✅ Payment successful:", result);
    // Navigate to success screen or update UI
  } catch (error) {
    console.error("❌ Payment failed:", error);
    // Show error message to user
  }
};
```

### Complete Example with Event Listeners

```typescript
import React, { useEffect } from "react";
import KhaltiPaymentSdk from "@bishaldahal/react-native-khalti-checkout";

const PaymentScreen = () => {
  useEffect(() => {
    // Set up event listeners
    const successSub = KhaltiPaymentSdk.onPaymentSuccess((payload) => {
      console.log("✅ Payment successful:", payload);
      // Handle successful payment (save to database, show success screen, etc.)
    });

    const errorSub = KhaltiPaymentSdk.onPaymentError((payload) => {
      console.log("❌ Payment failed:", payload);
      // Handle payment failure (show error message, retry option, etc.)
    });

    const cancelSub = KhaltiPaymentSdk.onPaymentCancel((payload) => {
      console.log("⏹️ Payment cancelled:", payload);
      // Handle payment cancellation (return to previous screen, etc.)
    });

    // Cleanup function
    return () => {
      successSub.remove();
      errorSub.remove();
      cancelSub.remove();
    };
  }, []);

  // Your component JSX
  return (
    // Your payment UI components
  );
};
```

## 📖 API Reference

### Core Methods

| Method               | Description                    | Parameters    | Returns                          |
| -------------------- | ------------------------------ | ------------- | -------------------------------- |
| `startPayment(args)` | Initiates payment process      | `PaymentArgs` | `Promise<PaymentSuccessPayload>` |
| `closePayment()`     | Closes current payment session | None          | `Promise<PaymentCloseResponse>`  |
| `getPaymentConfig()` | Gets current configuration     | None          | `Promise<PaymentConfigResponse>` |

### Payment Arguments

```typescript
interface PaymentArgs {
  publicKey: string; // Your Khalti public key (required)
  pidx: string; // Payment identifier from backend (required)
  environment?: "TEST" | "PROD"; // Environment (optional, defaults to 'TEST')
}
```

### Response Types

<details>
<summary>View response interfaces</summary>

```typescript
interface PaymentSuccessPayload {
  pidx: string;
  txnId: string;
  amount: number;
  mobile: string;
  // ... other fields
}

interface PaymentErrorPayload {
  error_key: string;
  error_description: string;
  // ... other fields
}
```

</details>

### Event Listeners

```typescript
// Subscribe to payment events
const successSubscription = KhaltiPaymentSdk.onPaymentSuccess(
  (payload: PaymentSuccessPayload) => {
    // Handle success
  }
);

const errorSubscription = KhaltiPaymentSdk.onPaymentError(
  (payload: PaymentErrorPayload) => {
    // Handle error
  }
);

const cancelSubscription = KhaltiPaymentSdk.onPaymentCancel((payload: any) => {
  // Handle cancellation
});

// Utility methods
KhaltiPaymentSdk.removeAllListeners(); // Clean up all listeners
KhaltiPaymentSdk.isReady(); // Check if SDK is ready
```

## 🔄 Payment Flow

1. **Create Payment** - Generate `pidx` in your backend using Khalti API
2. **Initialize Payment** - Call `startPayment()` with the `pidx`
3. **Handle Events** - Listen for success/error/cancel events
4. **Verify Payment** - Confirm payment status in your backend

### Backend Integration

<details>
<summary>📄 <strong>Node.js/Express Example</strong></summary>

```javascript
const express = require("express");
const app = express();

app.post("/create-khalti-payment", async (req, res) => {
  try {
    const response = await fetch(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      {
        method: "POST",
        headers: {
          Authorization: "key your_secret_key", // Your Khalti secret key
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          return_url: "https://yoursite.com/payment/success/",
          website_url: "https://yoursite.com/",
          amount: req.body.amount * 100, // Convert to paisa (smallest unit)
          purchase_order_id: req.body.orderId,
          purchase_order_name: req.body.orderName,
          customer_info: {
            name: req.body.customerName,
            email: req.body.customerEmail,
            phone: req.body.customerPhone,
          },
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      res.json({
        success: true,
        pidx: data.pidx,
      });
    } else {
      res.status(400).json({
        success: false,
        error: data.detail || "Payment initialization failed",
      });
    }
  } catch (error) {
    console.error("Khalti payment error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});
```

</details>

<details>
<summary>🐍 <strong>Python/Django Example</strong></summary>

```python
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def create_khalti_payment(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        payload = {
            'return_url': 'https://yoursite.com/payment/success/',
            'website_url': 'https://yoursite.com/',
            'amount': data['amount'] * 100,  # Convert to paisa
            'purchase_order_id': data['order_id'],
            'purchase_order_name': data['order_name'],
            'customer_info': {
                'name': data['customer_name'],
                'email': data['customer_email'],
                'phone': data['customer_phone'],
            }
        }

        headers = {
            'Authorization': 'key your_secret_key',
            'Content-Type': 'application/json',
        }

        try:
            response = requests.post(
                'https://a.khalti.com/api/v2/epayment/initiate/',
                json=payload,
                headers=headers
            )

            if response.status_code == 200:
                return JsonResponse({
                    'success': True,
                    'pidx': response.json()['pidx']
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Payment initialization failed'
                }, status=400)

        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
```

</details>

## 🛡️ Error Handling

```typescript
import { KhaltiErrorCode } from "@bishaldahal/react-native-khalti-checkout";

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

## ✅ Validation

Built-in validation for payment arguments:

```typescript
import { validatePaymentArgs } from "@bishaldahal/react-native-khalti-checkout";

const validation = validatePaymentArgs({
  publicKey: "your_key",
  pidx: "payment_id",
  environment: "TEST",
});

if (!validation.isValid) {
  console.log("Validation errors:", validation.errors);
}
```

## 🧪 Testing

### Test Credentials (Sandbox Environment)

| Field         | Value                        | Notes                         |
| ------------- | ---------------------------- | ----------------------------- |
| **Khalti ID** | `9800000000` to `9800000005` | Use any of these test numbers |
| **MPIN**      | `1111`                       | 4-digit PIN for Khalti wallet |
| **OTP**       | `987654`                     | 6-digit verification code     |

### Complete Test Implementation

```typescript
import React, { useState } from "react";
import { View, Button, Text, Alert, ActivityIndicator } from "react-native";
import KhaltiPaymentSdk from "@bishaldahal/react-native-khalti-checkout";

const TestPayment = () => {
  const [loading, setLoading] = useState(false);

  const createTestPayment = async () => {
    // Step 1: Create payment in your backend
    const response = await fetch("YOUR_BACKEND_URL/create-khalti-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 100, // NPR 100
        orderId: `test-${Date.now()}`,
        orderName: "Test Product",
      }),
    });

    const data = await response.json();
    return data.pidx;
  };

  const testPayment = async () => {
    setLoading(true);
    try {
      // Get pidx from your backend
      const pidx = await createTestPayment();

      // Initiate payment
      const result = await KhaltiPaymentSdk.startPayment({
        publicKey: "test_public_key_your_test_key",
        pidx: pidx,
        environment: "TEST",
      });

      Alert.alert(
        "✅ Success",
        `Payment completed!\nTransaction ID: ${result.txnId}`
      );
      console.log("Payment result:", result);
    } catch (error) {
      Alert.alert("❌ Error", error.message || "Payment failed");
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button
        title={loading ? "Processing..." : "Test Payment (NPR 100)"}
        onPress={testPayment}
        disabled={loading}
      />
      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
    </View>
  );
};
```

### Test Scenarios

| Scenario                 | Khalti ID           | Expected Result                  |
| ------------------------ | ------------------- | -------------------------------- |
| **Successful Payment**   | `9800000000`        | Payment completes successfully   |
| **Insufficient Balance** | `9800000001`        | Shows insufficient balance error |
| **Invalid PIN**          | Use wrong MPIN      | Shows invalid PIN error          |
| **Network Error**        | Disconnect internet | Shows network error              |

## 🔧 Troubleshooting

### Common Issues & Solutions

<details>
<summary><strong>❌ "No current activity" error</strong></summary>

**Cause**: Payment method called when React component is not properly mounted or Activity context is missing.

**Solutions**:

- Ensure you're calling payment from a mounted React component
- Check that your app has proper Activity context
- Wait for component to be fully loaded before initiating payment

```typescript
// ✅ Good practice
const [isReady, setIsReady] = useState(false);

useEffect(() => {
  setIsReady(true);
}, []);

const handlePayment = () => {
  if (!isReady) return;
  // Proceed with payment
};
```

</details>

<details>
<summary><strong>🔨 Build failures</strong></summary>

**Cause**: Using Expo Go or missing development build configuration.

**Solutions**:

- ✅ Use Expo Development Build, not Expo Go
- ✅ Verify all dependencies are installed: `npm install`
- ✅ Clear cache: `npx expo start --clear`
- ✅ Rebuild development client after adding native dependencies
- ✅ Check `eas.json` configuration

```bash
# Clean and rebuild
npx expo start --clear
eas build --profile development --platform android --clear-cache
```

</details>

<details>
<summary><strong>🚫 Payment not initiating</strong></summary>

**Cause**: Invalid configuration or network issues.

**Solutions**:

- ✅ Verify your public key is correct and active
- ✅ Ensure PIDX is valid and generated from your backend
- ✅ Check network connectivity
- ✅ Validate environment setting (`TEST` vs `PROD`)
- ✅ Check if payment amount meets minimum requirements

```typescript
// ✅ Validate before payment
import { validatePaymentArgs } from "@bishaldahal/react-native-khalti-checkout";

const validation = validatePaymentArgs(paymentArgs);
if (!validation.isValid) {
  console.error("Validation errors:", validation.errors);
  return;
}
```

</details>

<details>
<summary><strong>📱 "Module not found" or native module errors</strong></summary>

**Cause**: Native module not properly linked or built.

**Solutions**:

- ✅ Rebuild your development client after installing the package
- ✅ Clear Metro cache: `npx expo start --clear`
- ✅ For bare React Native: `npx react-native clean && npx react-native run-android`
- ✅ Check if package is properly listed in `package.json`

```bash
# For Expo projects
npx expo run:android

# For bare React Native
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

</details>

### Debug Mode

Debug logging is automatically enabled in development mode. Look for logs with `[KhaltiSDK]` prefix:

```typescript
// Enable additional debugging (optional)
console.log("Khalti SDK ready:", KhaltiPaymentSdk.isReady());
```

### Getting Help

1. **Check logs**: Look for `[KhaltiSDK]` prefixed logs in your console
2. **Validate args**: Use `validatePaymentArgs()` before calling `startPayment()`
3. **Test environment**: Ensure you're using correct test credentials
4. **Network**: Verify internet connectivity and API endpoints
5. **Create issue**: If problem persists, [create an issue](https://github.com/bishaldahal/react-native-khalti-checkout/issues) with:
   - Error message and stack trace
   - Your configuration (without sensitive keys)
   - Steps to reproduce
   - Device/emulator information

## 🔒 Security Best Practices

- **Use public keys only** in mobile apps
- **Verify payments server-side** always
- **Use HTTPS** for all communications
- **Validate on backend** - don't rely on client-side only

## 📱 Platform Support

<div align="center">

| Platform       | Status           | Version                | Notes                           |
| -------------- | ---------------- | ---------------------- | ------------------------------- |
| 🤖 **Android** | ✅ **Available** | API 21+ (Android 5.0+) | Fully supported with native SDK |
| 🍎 **iOS**     | ✅ **Available** | iOS 15.1+              | Fully supported with native SDK |
| 🌐 **Web**     | 🔮 **Planned**   | Modern Browsers        | Future release                  |

</div>

### Compatibility Matrix

| React Native | Expo SDK | Node.js | Status             |
| ------------ | -------- | ------- | ------------------ |
| 0.72+        | 49+      | 16+     | ✅ Fully Supported |
| 0.70-0.71    | 47-48    | 16+     | ⚠️ Partial Support |
| < 0.70       | < 47     | < 16    | ❌ Not Supported   |

> **📱 Android Recommendation**: For best experience, use Android 7.0+ (API 24+) with physical device testing.

## 📝 Example App

Explore our comprehensive [example application](./example) featuring:

<div align="center">

| 🔧 **Configuration**  | 💳 **Payment Scenarios** |    🚨 **Error Handling**     |  🎨 **UI Patterns**   |
| :-------------------: | :----------------------: | :--------------------------: | :-------------------: |
| Test/Production setup |  Complete payment flows  | Comprehensive error handling | Modern UI integration |

</div>

### Running the Example

```bash
# Clone and setup
git clone https://github.com/bishaldahal/react-native-khalti-checkout.git
cd react-native-khalti-checkout/example

# Install dependencies
npm install

# Start development server
npx expo start --dev-client
```

### Example Features

- 📋 **Complete Integration**: Full payment flow implementation
- 🎨 **UI Components**: Ready-to-use payment UI components
- � **Test Scenarios**: Various payment test cases
- 📱 **Best Practices**: Production-ready code patterns
- 🔧 **Configuration**: Environment setup examples

## �🤝 Contributing

We love contributions! Here's how you can help:

### Quick Contribution Guide

1. **🍴 Fork** the repository
2. **🌿 Create** your feature branch: `git checkout -b feature/amazing-feature`
3. **💾 Commit** your changes: `git commit -m 'Add amazing feature'`
4. **📤 Push** to the branch: `git push origin feature/amazing-feature`
5. **🔀 Open** a Pull Request

### Development Setup

```bash
# Clone repository
git clone https://github.com/bishaldahal/react-native-khalti-checkout.git
cd react-native-khalti-checkout

# Install dependencies
npm install

# Run example app
cd example && npm install && npx expo start
```

### Guidelines

- 📝 Follow existing code style and conventions
- ✅ Add tests for new features
- 📚 Update documentation when needed
- 🧪 Test on real Android devices when possible

See our [Contributing Guide](CONTRIBUTING.md) for detailed information.

## 📞 Support & Community

<div align="center">

### 🆘 Need Help?

| Resource             | Description           | Link                                                                                          |
| -------------------- | --------------------- | --------------------------------------------------------------------------------------------- |
| 📚 **Documentation** | Official Khalti docs  | [docs.khalti.com](https://docs.khalti.com/)                                                   |
| 🐛 **Bug Reports**   | Report issues & bugs  | [GitHub Issues](https://github.com/bishaldahal/react-native-khalti-checkout/issues)           |
| 💬 **Discussions**   | Community discussions | [GitHub Discussions](https://github.com/bishaldahal/react-native-khalti-checkout/discussions) |
| 📧 **Email Support** | Direct email support  | support@khalti.com                                                                            |

### 🔗 Useful Links

🏠 [**Repository**](https://github.com/bishaldahal/react-native-khalti-checkout) - Main GitHub repository

📦 [**NPM Package**](https://www.npmjs.com/package/@bishaldahal/react-native-khalti-checkout) - Package on npm registry

📈 [**Changelog**](CHANGELOG.md) - Version history and updates

🤝 [**Contributing**](CONTRIBUTING.md) - How to contribute

⚖️ [**License**](LICENSE) - MIT License details

### 🚀 Stay Updated

⭐ **Star** this repository to show support

👀 **Watch** for updates and releases

🔔 **Follow** [@bishaldahal](https://github.com/bishaldahal) for updates

</div>

## 📄 License

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
