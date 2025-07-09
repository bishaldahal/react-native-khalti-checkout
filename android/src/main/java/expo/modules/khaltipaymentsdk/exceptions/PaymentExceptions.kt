package expo.modules.khalticheckout.exceptions

import expo.modules.kotlin.exception.CodedException

/**
 * Custom exceptions for Khalti Payment SDK error handling.
 */

class InvalidConfigException(message: String) : CodedException("ERR_INVALID_CONFIG", message, null)

class NoActivityException : CodedException("ERR_NO_ACTIVITY", "No current activity available", null)

class PaymentInitException(message: String) : CodedException("ERR_PAYMENT_INIT", message, null)

class PaymentFailedException(message: String, cause: Throwable? = null) : CodedException("ERR_PAYMENT_FAILED", message, cause)

class PaymentCanceledException : CodedException("ERR_PAYMENT_CANCELED", "Payment was cancelled by the user", null)
