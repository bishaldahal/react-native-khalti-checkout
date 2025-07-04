# Khalti Payment SDK - Integration Examples

This document provides comprehensive examples of how to integrate the Khalti Payment SDK into different scenarios.

## Table of Contents

1. [Basic Integration](#basic-integration)
2. [Production Setup](#production-setup)
3. [Error Handling](#error-handling)
4. [Custom Configuration](#custom-configuration)
5. [Backend Integration](#backend-integration)
6. [Testing Strategies](#testing-strategies)

## Basic Integration

### 1. Simple Payment Flow

```typescript
import KhaltiPaymentSdk from 'khalti-payment-sdk';

// Initialize payment
const startPayment = async () => {
  try {
    const result = await KhaltiPaymentSdk.startPayment({
      publicKey: "test_public_key_your_key_here",
      pidx: "payment_identifier_from_api", 
      environment: "TEST"
    });
    
    console.log("Payment initiated:", result);
  } catch (error) {
    console.error("Payment failed:", error);
  }
};

// Listen for payment events
useEffect(() => {
  const successSub = KhaltiPaymentSdk.onPaymentSuccess((payload) => {
    console.log("Payment successful:", payload);
    // Handle successful payment
  });

  const errorSub = KhaltiPaymentSdk.onPaymentError((payload) => {
    console.log("Payment failed:", payload);
    // Handle payment error
  });

  const cancelSub = KhaltiPaymentSdk.onPaymentCancel(() => {
    console.log("Payment cancelled");
    // Handle payment cancellation
  });

  return () => {
    successSub.remove();
    errorSub.remove();
    cancelSub.remove();
  };
}, []);
```

### 2. Complete Payment Component

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import KhaltiPaymentSdk from 'khalti-payment-sdk';

const PaymentComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('Ready');

  useEffect(() => {
    // Set up event listeners
    const successSubscription = KhaltiPaymentSdk.onPaymentSuccess((payload) => {
      setPaymentStatus(`Success: ${payload.pidx}`);
      setIsLoading(false);
      Alert.alert('Payment Successful', `PIDX: ${payload.pidx}`);
    });

    const errorSubscription = KhaltiPaymentSdk.onPaymentError((payload) => {
      setPaymentStatus(`Error: ${payload.error}`);
      setIsLoading(false);
      Alert.alert('Payment Failed', payload.error);
    });

    const cancelSubscription = KhaltiPaymentSdk.onPaymentCancel(() => {
      setPaymentStatus('Cancelled');
      setIsLoading(false);
      Alert.alert('Payment Cancelled', 'User cancelled the payment');
    });

    return () => {
      successSubscription.remove();
      errorSubscription.remove();
      cancelSubscription.remove();
    };
  }, []);

  const handlePayment = async () => {
    setIsLoading(true);
    setPaymentStatus('Initiating...');

    try {
      // First, get pidx from your backend or Khalti API
      const pidx = await getPaymentIdentifier({
        amount: 1000, // Rs. 10 in paisa
        orderId: 'ORDER_123',
        orderName: 'Test Product'
      });

      // Start payment with the SDK
      await KhaltiPaymentSdk.startPayment({
        publicKey: "test_public_key_your_key_here",
        pidx: pidx,
        environment: "TEST"
      });
    } catch (error) {
      setIsLoading(false);
      setPaymentStatus('Failed to start');
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Status: {paymentStatus}</Text>
      <Button 
        title={isLoading ? "Processing..." : "Pay with Khalti"}
        onPress={handlePayment}
        disabled={isLoading}
      />
    </View>
  );
};

// Function to get payment identifier (implement based on your backend)
const getPaymentIdentifier = async (paymentData) => {
  // This should call your backend API
  // which then calls Khalti's initiate payment API
  const response = await fetch('/api/initiate-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });
  
  const data = await response.json();
  return data.pidx;
};
```

## Production Setup

### 1. Environment Configuration

```typescript
// config/khalti.ts
export const KhaltiConfig = {
  development: {
    publicKey: "test_public_key_your_key_here",
    environment: "TEST" as const,
    apiBaseUrl: "https://a.khalti.com"
  },
  production: {
    publicKey: "live_public_key_your_key_here", 
    environment: "PROD" as const,
    apiBaseUrl: "https://khalti.com"
  }
};

export const getKhaltiConfig = () => {
  return __DEV__ ? KhaltiConfig.development : KhaltiConfig.production;
};
```

### 2. Secure Backend Integration

```typescript
// Backend API call (recommended approach)
const initiatePaymentSecurely = async (paymentData) => {
  try {
    // Call your backend API
    const response = await fetch('https://yourapi.com/payments/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`, // Your app's auth token
      },
      body: JSON.stringify({
        amount: paymentData.amount,
        orderId: paymentData.orderId,
        customerInfo: paymentData.customerInfo
      })
    });

    if (!response.ok) {
      throw new Error('Failed to initiate payment');
    }

    const { pidx } = await response.json();
    return pidx;
  } catch (error) {
    throw new Error(`Payment initiation failed: ${error.message}`);
  }
};

// Usage in your component
const startSecurePayment = async () => {
  try {
    const pidx = await initiatePaymentSecurely({
      amount: 1000,
      orderId: 'ORDER_123',
      customerInfo: { name: 'John Doe', email: 'john@example.com' }
    });

    const config = getKhaltiConfig();
    await KhaltiPaymentSdk.startPayment({
      publicKey: config.publicKey,
      pidx: pidx,
      environment: config.environment
    });
  } catch (error) {
    console.error('Secure payment failed:', error);
  }
};
```

## Error Handling

### 1. Comprehensive Error Handling

```typescript
const handlePaymentWithErrorHandling = async () => {
  try {
    setIsLoading(true);
    setPaymentStatus('Starting payment...');

    const pidx = await getPaymentIdentifier(paymentData);
    
    await KhaltiPaymentSdk.startPayment({
      publicKey: config.publicKey,
      pidx: pidx,
      environment: config.environment
    });

  } catch (error) {
    setIsLoading(false);
    
    // Handle different types of errors
    if (error.message.includes('network')) {
      setPaymentStatus('Network error - please check connection');
      Alert.alert('Network Error', 'Please check your internet connection');
    } else if (error.message.includes('invalid')) {
      setPaymentStatus('Configuration error');
      Alert.alert('Configuration Error', 'Invalid payment configuration');
    } else if (error.message.includes('pidx')) {
      setPaymentStatus('Payment setup failed');
      Alert.alert('Setup Error', 'Failed to set up payment');
    } else {
      setPaymentStatus('Payment failed');
      Alert.alert('Payment Error', error.message);
    }
  }
};

// Enhanced event listeners with error categorization
useEffect(() => {
  const successSubscription = KhaltiPaymentSdk.onPaymentSuccess((payload) => {
    setPaymentStatus('Payment completed successfully');
    setIsLoading(false);
    
    // Log for analytics
    console.log('Payment success:', {
      pidx: payload.pidx,
      status: payload.status,
      timestamp: new Date().toISOString()
    });
    
    // Navigate to success screen or update UI
    navigateToSuccess(payload);
  });

  const errorSubscription = KhaltiPaymentSdk.onPaymentError((payload) => {
    setIsLoading(false);
    
    // Categorize errors
    const errorCategory = categorizeError(payload.error);
    setPaymentStatus(`Payment failed: ${errorCategory}`);
    
    // Log for debugging
    console.error('Payment error:', {
      error: payload.error,
      category: errorCategory,
      timestamp: new Date().toISOString()
    });
    
    // Show user-friendly error message
    showErrorMessage(errorCategory);
  });

  const cancelSubscription = KhaltiPaymentSdk.onPaymentCancel(() => {
    setPaymentStatus('Payment cancelled by user');
    setIsLoading(false);
    
    // Log cancellation
    console.log('Payment cancelled:', {
      timestamp: new Date().toISOString()
    });
  });

  return () => {
    successSubscription.remove();
    errorSubscription.remove();
    cancelSubscription.remove();
  };
}, []);

const categorizeError = (error: string): string => {
  if (error.toLowerCase().includes('network')) return 'Network issue';
  if (error.toLowerCase().includes('timeout')) return 'Request timeout';
  if (error.toLowerCase().includes('invalid')) return 'Invalid configuration';
  if (error.toLowerCase().includes('cancelled')) return 'User cancelled';
  return 'Unknown error';
};

const showErrorMessage = (category: string) => {
  const messages = {
    'Network issue': 'Please check your internet connection and try again.',
    'Request timeout': 'The request took too long. Please try again.',
    'Invalid configuration': 'Payment setup error. Please contact support.',
    'User cancelled': 'Payment was cancelled.',
    'Unknown error': 'An unexpected error occurred. Please try again.'
  };
  
  Alert.alert('Payment Error', messages[category] || messages['Unknown error']);
};
```

## Custom Configuration

### 1. Dynamic Configuration

```typescript
import { useState, useEffect } from 'react';

const useKhaltiConfig = () => {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      // Load from remote config or local storage
      const remoteConfig = await fetchRemoteConfig();
      const localConfig = await getLocalConfig();
      
      // Merge configurations with priority
      const mergedConfig = {
        ...localConfig,
        ...remoteConfig,
        environment: __DEV__ ? 'TEST' : 'PROD'
      };
      
      setConfig(mergedConfig);
    } catch (error) {
      console.error('Failed to load config:', error);
      // Fallback to default config
      setConfig(getDefaultConfig());
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    // Save to local storage
    saveLocalConfig(config);
  };

  return { config, isLoading, updateConfig };
};

// Usage
const PaymentScreen = () => {
  const { config, isLoading } = useKhaltiConfig();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const startPayment = async () => {
    // Use dynamic config
    await KhaltiPaymentSdk.startPayment({
      publicKey: config.publicKey,
      pidx: await getPaymentIdentifier(),
      environment: config.environment
    });
  };

  return (
    <PaymentComponent onStartPayment={startPayment} />
  );
};
```

## Backend Integration

### 1. Node.js Backend Example

```javascript
// backend/routes/payment.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Initiate payment endpoint
router.post('/initiate', async (req, res) => {
  try {
    const { amount, orderId, orderName, customerInfo } = req.body;
    
    // Validate input
    if (!amount || !orderId || !orderName) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    // Call Khalti API
    const khaltiResponse = await axios.post(
      'https://a.khalti.com/api/v2/epayment/initiate/',
      {
        return_url: process.env.KHALTI_RETURN_URL,
        website_url: process.env.KHALTI_WEBSITE_URL,
        amount: amount,
        purchase_order_id: orderId,
        purchase_order_name: orderName,
        customer_info: customerInfo
      },
      {
        headers: {
          'Authorization': `key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Return pidx to frontend
    res.json({
      pidx: khaltiResponse.data.pidx,
      expires_at: khaltiResponse.data.expires_at
    });

  } catch (error) {
    console.error('Payment initiation failed:', error);
    res.status(500).json({
      error: 'Failed to initiate payment'
    });
  }
});

// Verify payment endpoint
router.post('/verify', async (req, res) => {
  try {
    const { pidx } = req.body;
    
    // Call Khalti verification API
    const verificationResponse = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          'Authorization': `key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update your database with payment status
    await updatePaymentStatus(pidx, verificationResponse.data);

    res.json(verificationResponse.data);
  } catch (error) {
    console.error('Payment verification failed:', error);
    res.status(500).json({
      error: 'Failed to verify payment'
    });
  }
});

module.exports = router;
```

## Testing Strategies

### 1. Unit Testing

```typescript
// __tests__/PaymentComponent.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PaymentComponent from '../PaymentComponent';
import KhaltiPaymentSdk from 'khalti-payment-sdk';

// Mock the SDK
jest.mock('khalti-payment-sdk', () => ({
  startPayment: jest.fn(),
  onPaymentSuccess: jest.fn(() => ({ remove: jest.fn() })),
  onPaymentError: jest.fn(() => ({ remove: jest.fn() })),
  onPaymentCancel: jest.fn(() => ({ remove: jest.fn() })),
}));

describe('PaymentComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start payment when button is pressed', async () => {
    const mockStartPayment = KhaltiPaymentSdk.startPayment as jest.Mock;
    mockStartPayment.mockResolvedValue({ success: true });

    const { getByText } = render(<PaymentComponent />);
    const payButton = getByText('Pay with Khalti');
    
    fireEvent.press(payButton);
    
    await waitFor(() => {
      expect(mockStartPayment).toHaveBeenCalledWith({
        publicKey: expect.any(String),
        pidx: expect.any(String),
        environment: 'TEST'
      });
    });
  });

  it('should handle payment success', async () => {
    const mockOnSuccess = jest.fn();
    const { getByTestId } = render(
      <PaymentComponent onPaymentSuccess={mockOnSuccess} />
    );

    // Simulate payment success
    const successCallback = KhaltiPaymentSdk.onPaymentSuccess.mock.calls[0][0];
    successCallback({ pidx: 'test_pidx', status: 'completed' });

    expect(mockOnSuccess).toHaveBeenCalledWith({
      pidx: 'test_pidx',
      status: 'completed'
    });
  });
});
```

### 2. Integration Testing

```typescript
// __tests__/PaymentFlow.integration.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PaymentFlow from '../PaymentFlow';
import { mockKhaltiApi } from '../__mocks__/khaltiApi';

describe('Payment Flow Integration', () => {
  beforeEach(() => {
    mockKhaltiApi.reset();
  });

  it('should complete full payment flow', async () => {
    mockKhaltiApi.mockInitiatePayment({ pidx: 'test_pidx_123' });
    
    const { getByTestId, getByText } = render(<PaymentFlow />);
    
    // Fill payment form
    fireEvent.changeText(getByTestId('amount-input'), '1000');
    fireEvent.changeText(getByTestId('order-id-input'), 'ORDER_123');
    
    // Start payment
    fireEvent.press(getByText('Start Payment'));
    
    // Wait for payment initiation
    await waitFor(() => {
      expect(getByText('Payment initiated')).toBeTruthy();
    });
    
    // Simulate successful payment
    mockKhaltiApi.triggerPaymentSuccess({
      pidx: 'test_pidx_123',
      status: 'completed'
    });
    
    // Verify success state
    await waitFor(() => {
      expect(getByText('Payment Successful')).toBeTruthy();
    });
  });
});
```

### 3. End-to-End Testing

```typescript
// e2e/payment.e2e.ts
import { by, device, element, expect } from 'detox';

describe('Payment E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete payment flow', async () => {
    // Navigate to payment screen
    await element(by.text('Test Payment')).tap();
    
    // Fill payment details
    await element(by.id('amount-input')).typeText('1000');
    await element(by.id('order-name-input')).typeText('Test Product');
    
    // Start payment
    await element(by.text('Start Payment')).tap();
    
    // Wait for Khalti interface (this would be mocked in test environment)
    await waitFor(element(by.text('Payment Processing')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Complete payment (mocked action)
    await element(by.text('Complete Payment')).tap();
    
    // Verify success
    await expect(element(by.text('Payment Successful'))).toBeVisible();
  });
});
```

This comprehensive guide should help developers integrate the Khalti Payment SDK properly in various scenarios, from basic implementation to production-ready setups with proper error handling and testing.
