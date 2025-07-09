package expo.modules.khaltipaymentsdk.utils

import com.khalti.checkout.data.Environment
import com.khalti.checkout.data.KhaltiPayConfig
import expo.modules.khaltipaymentsdk.constants.KhaltiConstants
import expo.modules.khaltipaymentsdk.exceptions.InvalidConfigException
import expo.modules.khaltipaymentsdk.models.PaymentArgs

/**
 * Utility functions for payment configuration and validation.
 */
object PaymentUtils {

  /**
   * Validates payment arguments.
   *
   * @throws InvalidConfigException if arguments are invalid.
   */
  fun validatePaymentArgs(args: PaymentArgs) {
    if (args.publicKey.isBlank()) {
      throw InvalidConfigException("Public key is required")
    }
    if (args.pidx.isBlank()) {
      throw InvalidConfigException("PIDX is required")
    }
    if (args.publicKey.length < 10) {
      throw InvalidConfigException("Invalid public key format")
    }
  }

  /**
   * Parses environment string to Khalti Environment enum.
   */
  fun parseEnvironment(environment: String): Environment {
    return when (environment.uppercase()) {
      KhaltiConstants.ENV_PROD -> Environment.PROD
      KhaltiConstants.ENV_TEST, "" -> Environment.TEST
      else -> {
        android.util.Log.w(KhaltiConstants.TAG, "Unknown environment '$environment', defaulting to TEST")
        Environment.TEST
      }
    }
  }

  /**
   * Create payment configuration.
   */
  fun createPaymentConfig(args: PaymentArgs, environment: Environment): KhaltiPayConfig {
    return KhaltiPayConfig(
      publicKey = args.publicKey,
      pidx = args.pidx,
      environment = environment
    )
  }
}
