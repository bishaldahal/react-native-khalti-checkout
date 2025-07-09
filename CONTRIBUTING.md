# Contributing to @bishaldahal/react-native-khalti-checkout

First off, thank you for considering contributing to this project! 🎉

## Code of Conduct

By participating in this project, you are expected to uphold our code of conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Process

### Prerequisites

- Node.js 16+
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, when iOS support is added)

### Setting Up the Development Environment

```bash
# Clone your fork
git clone https://github.com/bishaldahal/react-native-khalti-checkout.git
cd react-native-khalti-checkout

# Install dependencies
npm install

# Build the module
npm run build

# Set up the example app
cd example
npm install
cp config.example.json config.json
# Edit config.json with your test credentials

# Start the example app
npx expo start
```

### Making Changes

1. Create a feature branch: `git checkout -b feature/my-new-feature`
2. Make your changes
3. Add tests for your changes
4. Run tests: `npm test`
5. Build the project: `npm run build`
6. Test in the example app
7. Commit your changes: `git commit -am 'Add some feature'`
8. Push to the branch: `git push origin feature/my-new-feature`
9. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Testing

- Write unit tests for new functionality
- Test on both Android devices/emulators
- Ensure example app works with your changes
- Test error handling scenarios

### Commit Messages

Use clear and meaningful commit messages:

```
Add support for custom payment timeout

- Add timeout parameter to PaymentArgs interface
- Implement timeout handling in Android module
- Update documentation with timeout examples
- Add timeout validation tests
```

## Project Structure

```
├── src/                    # TypeScript source code
├── android/               # Android native module
├── ios/                   # iOS native module (coming soon)
├── example/              # Example application
├── build/                # Built JavaScript files
└── docs/                 # Documentation
```

## Security Guidelines

- **Never commit real API keys or secrets**
- Use placeholder values in example configurations
- Validate all inputs in native modules
- Follow secure coding practices
- Report security vulnerabilities privately

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a pull request with the changes
4. After merge, create a new release on GitHub
5. The CI/CD pipeline will automatically publish to npm

## Getting Help

- Check the [documentation](README.md)
- Look at [existing issues](https://github.com/bishaldahal/react-native-khalti-checkout/issues)
- Ask questions in [GitHub Discussions](https://github.com/bishaldahal/react-native-khalti-checkout/discussions)

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions

Thank you for contributing! 🚀
