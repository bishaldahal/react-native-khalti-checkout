package expo.modules.khalticheckout.constants

/**
 * Constants used throughout the Khalti Payment SDK module.
 */
object KhaltiConstants {
  const val TAG = "KhaltiPaymentSDK"
  
  // Error codes
  const val ERROR_NO_ACTIVITY = "ERR_NO_ACTIVITY"
  const val ERROR_PAYMENT_INIT = "ERR_PAYMENT_INIT"
  const val ERROR_PAYMENT_FAILED = "ERR_PAYMENT_FAILED"
  const val ERROR_PAYMENT_CANCELED = "ERR_PAYMENT_CANCELED"
  const val ERROR_INVALID_CONFIG = "ERR_INVALID_CONFIG"
  const val ERROR_CLOSE_FAILED = "ERR_CLOSE_PAYMENT"
  const val ERROR_GET_CONFIG = "ERR_GET_CONFIG"

  // Environment constants
  const val ENV_PROD = "PROD"
  const val ENV_TEST = "TEST"
  
  // Event names
  const val EVENT_PAYMENT_SUCCESS = "onPaymentSuccess"
  const val EVENT_PAYMENT_ERROR = "onPaymentError"
  const val EVENT_PAYMENT_CANCEL = "onPaymentCancel"
}
