import ExpoModulesCore
import Foundation

/// Custom exceptions for Khalti Payment SDK
class PaymentException: Exception {
    override var reason: String {
        return "Payment error occurred"
    }
}

class PaymentInitException: Exception {
    override var reason: String {
        return "Failed to initialize payment"
    }

    override var code: String {
        return KhaltiConstants.errorPaymentInit
    }
}

class PaymentFailedException: Exception {
    override var reason: String {
        return "Payment failed"
    }

    override var code: String {
        return KhaltiConstants.errorPaymentFailed
    }
}

class PaymentCanceledException: Exception {
    override var reason: String {
        return "Payment was cancelled by user"
    }

    override var code: String {
        return KhaltiConstants.errorPaymentCanceled
    }
}

class NoViewControllerException: Exception {
    override var reason: String {
        return "No view controller available for presentation"
    }

    override var code: String {
        return KhaltiConstants.errorNoViewController
    }
}

class InvalidConfigException: Exception {
    override var reason: String {
        return "Invalid payment configuration"
    }

    override var code: String {
        return KhaltiConstants.errorInvalidConfig
    }
}
