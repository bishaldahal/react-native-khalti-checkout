# Khalti Payment SDK Example

This example app demonstrates how to integrate the Khalti Payment SDK into your React Native/Expo application.

## Features

- **Environment Configuration**: Switch between TEST and PROD modes
- **Advanced Configuration**: Configure Khalti keys and URLs
- **Professional UI**: Clean, modern interface for testing
- **Comprehensive Form**: Test different payment scenarios
- **Security Warnings**: Built-in reminders about production security

## Getting Started

### Prerequisites

- Node.js 16 or higher
- Expo CLI
- Khalti Merchant Account (for testing/production)

### Installation

1. Navigate to the example directory:
   ```bash
   cd example
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

### Configuration

#### Option 1: Use the App Interface
1. Open the app
2. Toggle "Test Mode" to switch between TEST/PROD environments
3. Tap "Show Advanced Configuration" to enter your Khalti credentials
4. Fill in your public key, secret key, and URLs

#### Option 2: Create a Config File
1. Copy the example config:
   ```bash
   cp config.example.json config.json
   ```

2. Update `config.json` with your actual Khalti credentials

**Important**: Add `config.json` to your `.gitignore` to avoid committing sensitive keys.

## Usage

### Test Mode (Default)
- Uses Khalti's test environment
- Safe for development and testing
- No real money transactions

### Production Mode
- Uses Khalti's live environment
- Requires valid production credentials
- Processes real payments

## Configuration Options

| Field | Description | Example |
|-------|-------------|---------|
| Public Key | Your Khalti merchant public key | `test_public_key_xxx` |
| Secret Key | Your Khalti merchant secret key | `test_secret_key_xxx` |
| Environment | TEST or PROD | `TEST` |
| Return URL | URL for payment completion | `https://yourapp.com/payment/` |
| Website URL | Your website URL | `https://yourapp.com` |

## Testing Different Scenarios

### Basic Payment Test
1. Set amount to 1000 (Rs. 10)
2. Use default order details
3. Tap "Start Payment"
4. Complete payment in Khalti interface

### Custom Payment Test
1. Modify amount, order ID, and customer info
2. Test different payment amounts
3. Verify payment callbacks

### Error Testing
1. Use invalid credentials
2. Test network failures
3. Test user cancellation

## Payment Flow

1. **Configure**: Set up your Khalti credentials
2. **Initiate**: App calls Khalti API to get payment identifier (pidx)
3. **Start**: SDK opens Khalti payment interface
4. **Process**: User completes payment in Khalti
5. **Callback**: App receives success/error/cancel events

## Security Notes

⚠️ **Important Security Guidelines**:

1. **Never store secret keys in your app**: This example includes secret keys for demonstration only
2. **Use backend API**: In production, call Khalti API from your secure backend server
3. **Validate payments**: Always verify payment status on your backend
4. **Use HTTPS**: Ensure all URLs use HTTPS in production

## Environment Variables

For production apps, use environment variables:

```typescript
const config = {
  publicKey: process.env.KHALTI_PUBLIC_KEY,
  secretKey: process.env.KHALTI_SECRET_KEY, // Backend only!
  environment: process.env.NODE_ENV === 'production' ? 'PROD' : 'TEST'
};
```

## Common Issues

### "Module not found" Error
- Ensure the parent SDK is properly built: `cd .. && npm run build`

### "Invalid credentials" Error
- Verify your public/secret keys are correct
- Check if you're using TEST keys in TEST mode and PROD keys in PROD mode

### Payment doesn't start
- Verify your public key is valid
- Check network connectivity
- Ensure pidx is properly obtained from the API

## API Reference

See the main SDK documentation for detailed API reference.

## Support

- [Khalti Documentation](https://docs.khalti.com/)
- [SDK Repository](https://github.com/bishaldahal/khalti-payment-sdk)
- [Report Issues](https://github.com/bishaldahal/khalti-payment-sdk/issues)

## License

MIT License - see LICENSE file for details.
