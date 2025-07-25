import Foundation
import os.log

/// Logging utility for Khalti Payment SDK
class AppLogger {
    private static let logger = OSLog(
        subsystem: Bundle.main.bundleIdentifier ?? "KhaltiPaymentSDK", category: "KhaltiPayment")

    static func d(_ tag: String, _ message: String) {
        os_log("%{public}@: %{public}@", log: logger, type: .debug, tag, message)
    }

    static func w(_ tag: String, _ message: String) {
        os_log("%{public}@: %{public}@", log: logger, type: .default, tag, message)
    }

    static func e(_ tag: String, _ message: String, _ error: Error? = nil) {
        if let error = error {
            os_log(
                "%{public}@: %{public}@ - Error: %{public}@", log: logger, type: .error, tag,
                message, error.localizedDescription)
        } else {
            os_log("%{public}@: %{public}@", log: logger, type: .error, tag, message)
        }
    }
}
