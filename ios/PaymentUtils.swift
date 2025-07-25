import Foundation
import KhaltiCheckout

/// Utilities for payment operations
class PaymentUtils {

    /**
     * Validates payment arguments
     */
    static func validatePaymentArgs(_ args: PaymentArgs) throws {
        if args.publicKey.isEmpty {
            AppLogger.e("PaymentValidation", "Public key is required")
            throw InvalidConfigException()
        }

        if args.pidx.isEmpty {
            AppLogger.e("PaymentValidation", "PIDX is required")
            throw InvalidConfigException()
        }

        if !["TEST", "PROD"].contains(args.environment.uppercased()) {
            AppLogger.e("PaymentValidation", "Invalid environment: \(args.environment)")
            throw InvalidConfigException()
        }
    }

    /**
     * Parses environment string to Khalti environment
     */
    static func parseEnvironment(_ environment: String) -> Environment {
        switch environment.uppercased() {
        case "PROD":
            return .PROD
        default:
            return .TEST
        }
    }

    /**
     * Creates payment configuration from arguments
     */
    static func createPaymentConfig(_ args: PaymentArgs, _ environment: Environment)
        -> KhaltiPayConfig
    {
        return KhaltiPayConfig(
            publicKey: args.publicKey,
            pIdx: args.pidx,
            environment: environment
        )
    }
}
