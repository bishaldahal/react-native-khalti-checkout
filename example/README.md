# @bishaldahal/react-native-khalti-checkout Example

This example app demonstrates how to integrate the `@bishaldahal/react-native-khalti-checkout` SDK into your React Native/Expo application.

## Features

- **Environment Configuration**: Switch between TEST and PROD modes
- **Advanced Configuration**: Configure Khalti keys and URLs
- **Professional UI**: Clean, modern interface for testing
- **Comprehensive Form**: Test different payment scenarios
- **Security Warnings**: Built-in reminders about production security
- **Real-time Validation**: Form validation with helpful error messages
- **Customer Information**: Optional customer details integration
- **Payment Status Tracking**: Live status updates during payment flow

## Getting Started

### Prerequisites

- Node.js 16 or higher
- Expo CLI or Expo Development Build
- Khalti Merchant Account (for testing/production)
- Android device/emulator (iOS support coming soon)

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

4. Run on Android device or emulator:
   ```bash
   npx expo run:android
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
- Uses Khalti's test environment (`https://a.khalti.com`)
- Safe for development and testing
- No real money transactions
- Pre-configured test credentials included

### Production Mode
- Uses Khalti's live environment (`https://khalti.com`)
- Requires valid production credentials
- Processes real payments
- **Warning**: Only use with valid production keys

## Configuration Options

| Field | Description | Example | Required |
|-------|-------------|---------|----------|
| Public Key | Your Khalti merchant public key | `test_public_key_xxx` | ✅ |
| Secret Key | Your Khalti merchant secret key | `test_secret_key_xxx` | ✅ |
| Environment | TEST or PROD | `TEST` | ✅ |
| Return URL | URL for payment completion | `https://yourapp.com/payment/` | ✅ |
| Website URL | Your website URL | `https://yourapp.com` | ✅ |

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
4. Test validation errors

### Customer Information Testing
1. Add customer name, email, and phone
2. Test email validation
3. Test phone number validation
4. Verify customer data in payment flow

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
- Verify the SDK is properly linked in your expo module

### "Invalid credentials" Error
- Verify your public/secret keys are correct
- Check if you're using TEST keys in TEST mode and PROD keys in PROD mode
- Ensure there are no extra spaces in your keys

### Payment doesn't start
- Verify your public key is valid
- Check network connectivity
- Ensure pidx is properly obtained from the API
- Check if you're using the correct environment

### Build/Development Issues
- Use Expo Development Build, not Expo Go
- Ensure Android emulator/device is properly connected
- Check that all dependencies are installed correctly

### Network/API Issues
- Verify API endpoints are correct for your environment
- Check if your secret key has proper permissions
- Ensure your merchant account is properly set up

## Features Demonstrated

### Form Validation
- Real-time input validation
- Error message display
- Required field indicators
- Email and phone number validation

### Payment Flow
- Environment switching
- Configuration management
- Payment initiation
- Status tracking
- Event handling

### Error Handling
- Network error recovery
- Invalid input handling
- Payment failure scenarios
- User cancellation handling

### UI/UX Features
- Loading states
- Status indicators
- Professional styling
- Responsive design
- Accessibility support

## API Reference

See the main SDK documentation for detailed API reference.

## Support

- [Khalti Documentation](https://docs.khalti.com/)
- [SDK Repository](https://github.com/bishaldahal/khalti-payment-sdk)
- [Report Issues](https://github.com/bishaldahal/khalti-payment-sdk/issues)

## License

MIT License - see LICENSE file for details.
