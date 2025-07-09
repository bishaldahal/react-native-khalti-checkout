# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- iOS support (planned)
- Web support (planned)

## [0.1.0] - 2025-01-09

### Added
- Initial release of React Native/Expo SDK for Khalti Payment Gateway
- Android support with Khalti's native Android SDK
- Basic payment functionality with `startPayment`, `closePayment`, and `getPaymentConfig` methods
- Event-driven architecture with success, error, and cancel events
- TypeScript support with comprehensive type definitions
- Input validation and sanitization utilities
- Environment support (TEST and PROD)
- Comprehensive error handling with specific error codes
- Development debugging tools with conditional logging
- Example application demonstrating integration patterns
- Detailed documentation and integration guides

### Security
- Secure handling of API keys with environment-based validation
- Built-in protection against key misuse (test keys in prod, etc.)
- No storage of sensitive payment data

### Dependencies
- expo-modules-core ^2.4.2
- Khalti checkout-android SDK integration

### Platform Support
- ✅ Android (API 21+)
- 🚧 iOS (coming soon)
- 🚧 Web (planned)

---

## Release Notes Format

### Added
For new features.

### Changed
For changes in existing functionality.

### Deprecated
For soon-to-be removed features.

### Removed
For now removed features.

### Fixed
For any bug fixes.

### Security
In case of vulnerabilities.
