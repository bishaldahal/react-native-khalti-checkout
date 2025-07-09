package expo.modules.khaltipaymentsdk

import com.khalti.checkout.Khalti
import com.khalti.checkout.data.PaymentResult
import com.khalti.checkout.resource.OnMessagePayload
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.khaltipaymentsdk.constants.KhaltiConstants
import expo.modules.khaltipaymentsdk.exceptions.*
import expo.modules.khaltipaymentsdk.handlers.PaymentResultHandler
import expo.modules.khaltipaymentsdk.models.PaymentArgs
import expo.modules.khaltipaymentsdk.utils.PaymentUtils

/**
 * Expo module for integrating Khalti Payment Gateway in React Native/Expo applications.
 *
 * This module provides a native Android interface for Khalti's checkout-android SDK, enabling
 * seamless payment processing for Nepalese merchants. It supports payments via Khalti wallet,
 * eBanking, mobile banking, and cards.
 *
 * @author Bishal Dahal
 * @version 0.1.0
 * @since 0.1.0
 */
class KhaltiPaymentSdkModule : Module() {

  private var khalti: Khalti? = null
  private val paymentResultHandler = PaymentResultHandler(this)

  override fun definition() = ModuleDefinition {
    Name("KhaltiPaymentSdk")

    // Define events that can be emitted to React Native
    Events(
      KhaltiConstants.EVENT_PAYMENT_SUCCESS, 
      KhaltiConstants.EVENT_PAYMENT_ERROR, 
      KhaltiConstants.EVENT_PAYMENT_CANCEL
    )

    /**
     * Initialize and start payment process
     * 
     * @param args PaymentArgs containing publicKey, pidx, and environment
     * @param promise Promise to resolve/reject based on payment outcome
     */
    AsyncFunction("startPayment") { args: PaymentArgs, promise: Promise ->
      try {
        PaymentUtils.validatePaymentArgs(args)
        initializePayment(args, promise)
      } catch (e: CodedException) {
        AppLogger.e("PaymentInit", "Failed to start payment: ${e.message}", e)
        promise.reject(e)
      } catch (e: Exception) {
        AppLogger.e("PaymentInit", "Unexpected error starting payment: ${e.message}", e)
        promise.reject(KhaltiConstants.ERROR_PAYMENT_INIT, "Failed to initialize payment: ${e.message}", e)
      }
    }

    /**
     * Closes the current Khalti payment session.
     *
     * @param promise Resolves with a confirmation or rejects if closing fails.
     */
    AsyncFunction("closePayment") { promise: Promise ->
      try {
        khalti?.close()
        khalti = null
        promise.resolve(mapOf("status" to "closed"))
        AppLogger.d("PaymentSession", "Payment session closed successfully")
      } catch (e: Exception) {
        AppLogger.e("PaymentSession", "Failed to close payment: ${e.message}", e)
        promise.reject(KhaltiConstants.ERROR_CLOSE_FAILED, "Failed to close payment: ${e.message}", e)
      }
    }

    /**
     * Retrieves the current Khalti payment configuration.
     *
     * @param promise Resolves with the configuration or null if none exists.
     */
    AsyncFunction("getPaymentConfig") { promise: Promise ->
      try {
        val config = khalti?.config
        if (config != null) {
          val configData = mapOf(
            "publicKey" to config.publicKey,
            "pidx" to config.pidx,
            "environment" to config.environment.name
          )
          promise.resolve(configData)
        } else {
          promise.resolve(null)
        }
      } catch (e: Exception) {
        AppLogger.e("PaymentConfig", "Failed to get config: ${e.message}", e)
        promise.reject(KhaltiConstants.ERROR_GET_CONFIG, "Failed to get payment configuration: ${e.message}", e)
      }
    }

    // Clean up on module destruction
    OnDestroy {
      khalti?.close()
      khalti = null
      AppLogger.d("ModuleLifecycle", "KhaltiPaymentSdkModule destroyed")
    }
  }

  /**
   * Initializes a Khalti payment session.
   */
  private fun initializePayment(args: PaymentArgs, promise: Promise) {
    val currentActivity = appContext.currentActivity
      ?: throw NoActivityException()

    try {
      val environment = PaymentUtils.parseEnvironment(args.environment)
      val config = PaymentUtils.createPaymentConfig(args, environment)

      khalti = Khalti.init(
        context = currentActivity,
        config = config,
        onPaymentResult = { paymentResult: PaymentResult, khalti: Khalti ->
          paymentResultHandler.handlePaymentResult(paymentResult, khalti, args, promise)
        },
        onMessage = { payload: OnMessagePayload, khalti: Khalti ->
          paymentResultHandler.handlePaymentMessage(payload, khalti, args, promise)
        },
        onReturn = { khalti: Khalti ->
          paymentResultHandler.handlePaymentReturn(khalti)
        }
      )

      khalti?.open()
      AppLogger.d("PaymentInit", "Payment initialized for PIDX: ${args.pidx}, Environment: ${args.environment}")
    } catch (e: Exception) {
      AppLogger.e("PaymentInit", "Payment initialization failed: ${e.message}", e)
      throw PaymentInitException(e.message ?: "Unknown initialization error")
    }
  }

}