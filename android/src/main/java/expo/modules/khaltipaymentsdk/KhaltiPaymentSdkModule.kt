package expo.modules.khaltipaymentsdk

import android.util.Log
import com.khalti.checkout.Khalti
import com.khalti.checkout.data.Environment
import com.khalti.checkout.data.KhaltiPayConfig
import com.khalti.checkout.resource.OnMessagePayload
import com.khalti.checkout.resource.OnMessageEvent
import com.khalti.checkout.data.PaymentResult
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

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

  companion object {
    private const val TAG = "KhaltiPaymentSDK"
    private const val ERROR_NO_ACTIVITY = "ERR_NO_ACTIVITY"
    private const val ERROR_PAYMENT_INIT = "ERR_PAYMENT_INIT"
    private const val ERROR_PAYMENT_FAILED = "ERR_PAYMENT_FAILED"
    private const val ERROR_PAYMENT_CANCELED = "ERR_PAYMENT_CANCELED"
    private const val ERROR_INVALID_CONFIG = "ERR_INVALID_CONFIG"
    private const val ERROR_CLOSE_FAILED = "ERR_CLOSE_PAYMENT"
    private const val ERROR_GET_CONFIG = "ERR_GET_CONFIG"

    private const val ENV_PROD = "PROD"
    private const val ENV_TEST = "TEST"
  }

  private var khalti: Khalti? = null

  override fun definition() = ModuleDefinition {
    Name("KhaltiPaymentSdk")

    // Define events that can be emitted to React Native
    Events("onPaymentSuccess", "onPaymentError", "onPaymentCancel")

    /**
     * Initialize and start payment process
     * 
     * @param args PaymentArgs containing publicKey, pidx, and environment
     * @param promise Promise to resolve/reject based on payment outcome
     */
    AsyncFunction("startPayment") { args: PaymentArgs, promise: Promise ->
      try {
        validatePaymentArgs(args)
        initializePayment(args, promise)
      } catch (e: CodedException) {
        Log.e(TAG, "Failed to start payment: ${e.message}", e)
        promise.reject(e)
      } catch (e: Exception) {
        Log.e(TAG, "Unexpected error starting payment: ${e.message}", e)
        promise.reject(ERROR_PAYMENT_INIT, "Failed to initialize payment: ${e.message}", e)
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
        Log.d(TAG, "Payment session closed successfully")
      } catch (e: Exception) {
        Log.e(TAG, "Failed to close payment: ${e.message}", e)
        promise.reject(ERROR_CLOSE_FAILED, "Failed to close payment: ${e.message}", e)
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
        Log.e(TAG, "Failed to get config: ${e.message}", e)
        promise.reject(ERROR_GET_CONFIG, "Failed to get payment configuration: ${e.message}", e)
      }
    }

    // Clean up on module destruction
    OnDestroy {
      khalti?.close()
      khalti = null
      Log.d(TAG, "KhaltiPaymentSdkModule destroyed")
    }
  }

  /**
   * Validates payment arguments.
   *
   * @throws InvalidConfigException if arguments are invalid.
   */
  private fun validatePaymentArgs(args: PaymentArgs) {
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
   * Initializes a Khalti payment session.
   */
  private fun initializePayment(args: PaymentArgs, promise: Promise) {
    val currentActivity = appContext.currentActivity
      ?: throw NoActivityException()

    try {
      val environment = parseEnvironment(args.environment)
      val config = createPaymentConfig(args, environment)

      khalti = Khalti.init(
        context = currentActivity,
        config = config,
        onPaymentResult = { paymentResult: PaymentResult, khalti: Khalti ->
          handlePaymentResult(paymentResult, khalti, args, promise)
        },
        onMessage = { payload, khalti ->
          handlePaymentMessage(payload, khalti, args, promise)
        },
        onReturn = { khalti: Khalti ->
          handlePaymentReturn(khalti)
        }
      )

      khalti?.open()
      Log.d(TAG, "Payment initialized for PIDX: ${args.pidx}, Environment: ${args.environment}")
    } catch (e: Exception) {
      Log.e(TAG, "Payment initialization failed: ${e.message}", e)
      throw PaymentInitException(e.message ?: "Unknown initialization error")
    }
  }

  /**
   * Parses environment string to Khalti Environment enum.
   */
  private fun parseEnvironment(environment: String): Environment {
    return when (environment.uppercase()) {
      ENV_PROD -> Environment.PROD
      ENV_TEST, "" -> Environment.TEST
      else -> {
        Log.w(TAG, "Unknown environment '$environment', defaulting to TEST")
        Environment.TEST
      }
    }
  }

  /**
   * Create payment configuration
   */
  private fun createPaymentConfig(args: PaymentArgs, environment: Environment): KhaltiPayConfig {
    return KhaltiPayConfig(
      publicKey = args.publicKey,
      pidx = args.pidx,
      environment = environment
    )
  }

  /**
   * Handles payment result from Khalti SDK.
   */
  private fun handlePaymentResult(paymentResult: PaymentResult, khalti: Khalti, args: PaymentArgs, promise: Promise) {
    Log.d(TAG, "Payment result: ${paymentResult.status}, Transaction ID: ${paymentResult.payload?.transactionId}")

    try {
      khalti.close()
      val payload = paymentResult.payload
      val successData = mapOf(
        "pidx" to payload?.pidx,
        "status" to paymentResult.status,
        "transactionId" to payload?.transactionId,
        "totalAmount" to payload?.totalAmount,
        "fee" to payload?.fee,
        "refunded" to payload?.refunded,
        "purchaseOrderId" to payload?.purchaseOrderId,
        "purchaseOrderName" to payload?.purchaseOrderName,
        "extraMerchantParams" to payload?.extraMerchantParams,
        "timestamp" to System.currentTimeMillis()
      )
      sendEvent("onPaymentSuccess", successData)
      promise.resolve(successData)
    } catch (e: Exception) {
      handlePaymentError("Failed to process payment result", e, promise)
    }
  }

  /**
   * Handles payment messages (e.g., errors, cancellations) from Khalti SDK.
   */
  private fun handlePaymentMessage(payload: OnMessagePayload, khalti: Khalti, args: PaymentArgs, promise: Promise) {
    Log.w(TAG, "Payment message: ${payload.event}, Code: ${payload.code}, Message: ${payload.message}")
    try {
      khalti.close()
      when (payload.event) {
        OnMessageEvent.KPGDisposed -> {
          val cancelData = mapOf(
            "pidx" to args.pidx,
            "reason" to "user_cancelled",
            "timestamp" to System.currentTimeMillis()
          )
          sendEvent("onPaymentCancel", cancelData)
          promise.reject(PaymentCanceledException())
        }
        OnMessageEvent.ReturnUrlLoadFailure, OnMessageEvent.NetworkFailure, OnMessageEvent.PaymentLookUpFailure -> {
          val errorData = mapOf(
            "pidx" to args.pidx,
            "error" to payload.message,
            "status" to "failed",
            "code" to payload.code,
            "event" to payload.event,
            "timestamp" to System.currentTimeMillis()
          )
          sendEvent("onPaymentError", errorData)
          promise.reject(PaymentFailedException(payload.message, payload.throwable))
        }
        OnMessageEvent.Unknown -> {
          val errorData = mapOf(
            "pidx" to args.pidx,
            "error" to payload.message,
            "status" to "failed",
            "code" to payload.code,
            "event" to payload.event,
            "timestamp" to System.currentTimeMillis()
          )
          sendEvent("onPaymentError", errorData)
          promise.reject(PaymentFailedException(payload.message, payload.throwable))
        }
        else -> {
          if (payload.needsPaymentConfirmation) {
            val successData = mapOf(
              "pidx" to args.pidx,
              "status" to "needs_verification",
              "message" to payload.message,
              "code" to payload.code,
              "timestamp" to System.currentTimeMillis()
            )
            sendEvent("onPaymentSuccess", successData)
            promise.resolve(successData)
          } else {
            val errorData = mapOf(
              "pidx" to args.pidx,
              "error" to payload.message,
              "status" to "failed",
              "code" to payload.code,
              "event" to payload.event,
              "timestamp" to System.currentTimeMillis()
            )
            sendEvent("onPaymentError", errorData)
            promise.reject(PaymentFailedException(payload.message, payload.throwable))
          }
        }
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error handling payment message: ${e.message}", e)
      handlePaymentError("Failed to process payment message", e, promise)
    }
  }

  /**
   * Handles return URL callback from Khalti.
   */
  private fun handlePaymentReturn(@Suppress("UNUSED_PARAMETER") khalti: Khalti) {
    Log.d(TAG, "Payment return URL loaded")

    // Optional: Send event to React Native if needed
    // sendEvent("onPaymentReturn", mapOf("status" to "return_url_loaded"))
  }

  /**
   * Handles payment errors consistently.
   */
  private fun handlePaymentError(message: String, error: Throwable?, promise: Promise) {
    val errorData = mapOf(
      "error" to message,
      "status" to "failed",
      "timestamp" to System.currentTimeMillis(),
      "details" to (error?.message ?: "Unknown error")
    )
    sendEvent("onPaymentError", errorData)
    promise.reject(PaymentFailedException(message, error))
  }

  /**
   * Custom exceptions for better error handling.
   */
  class InvalidConfigException(message: String) : CodedException(ERROR_INVALID_CONFIG, message, null)
  class NoActivityException : CodedException(ERROR_NO_ACTIVITY, "No current activity available", null)
  class PaymentInitException(message: String) : CodedException(ERROR_PAYMENT_INIT, message, null)
  class PaymentFailedException(message: String, cause: Throwable? = null) : CodedException(ERROR_PAYMENT_FAILED, message, cause)
  class PaymentCanceledException : CodedException(ERROR_PAYMENT_CANCELED, "Payment was cancelled by the user", null)

  /**
   * Payment arguments for configuring Khalti payment.
   *
   * @property publicKey Khalti merchant public key.
   * @property pidx Unique payment identifier from Khalti initiation.
   * @property environment Payment environment ("TEST" or "PROD").
   */
  class PaymentArgs : Record {
    @Field
    val publicKey: String = ""

    @Field
    val pidx: String = ""

    @Field
    val environment: String = ENV_TEST
  }

}