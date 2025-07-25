import Foundation

/**
 * Constants used throughout the Khalti Payment SDK module.
 */
struct KhaltiConstants {
    static let tag = "KhaltiPaymentSDK"
    
    // Error codes
    static let errorNoViewController = "ERR_NO_VIEW_CONTROLLER"
    static let errorPaymentInit = "ERR_PAYMENT_INIT"
    static let errorPaymentFailed = "ERR_PAYMENT_FAILED"
    static let errorPaymentCanceled = "ERR_PAYMENT_CANCELED"
    static let errorInvalidConfig = "ERR_INVALID_CONFIG"
    static let errorCloseFailed = "ERR_CLOSE_PAYMENT"
    static let errorGetConfig = "ERR_GET_CONFIG"
    
    // Environment constants
    static let envProd = "PROD"
    static let envTest = "TEST"
    
    // Event names
    static let eventPaymentSuccess = "onPaymentSuccess"
    static let eventPaymentError = "onPaymentError"
    static let eventPaymentCancel = "onPaymentCancel"
}
