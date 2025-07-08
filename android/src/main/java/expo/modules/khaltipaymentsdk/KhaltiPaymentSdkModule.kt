package expo.modules.khaltipaymentsdk

import android.util.Log
import com.khalti.checkout.Khalti
import com.khalti.checkout.data.Environment
import com.khalti.checkout.data.KhaltiPayConfig
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

/**
 * Expo module for Khalti Payment Gateway integration
 * 
 * This module provides React Native interface for Khalti's checkout-android SDK,
 * enabling seamless payment processing for Nepalese merchants.
 * 
 * @author Bishal Dahal
 * @version 0.1.0
 */
class KhaltiPaymentSdkModule : Module() {
  
  companion object {
    private const val TAG = "KhaltiPaymentSDK"
    private const val ERROR_NO_ACTIVITY = "ERR_NO_ACTIVITY"
    private const val ERROR_PAYMENT_INIT = "ERR_PAYMENT_INIT"
    private const val ERROR_PAYMENT_FAILED = "ERR_PAYMENT_FAILED"
    private const val ERROR_PAYMENT_CANCELED = "ERR_PAYMENT_CANCELED"
    private const val ERROR_INVALID_CONFIG = "ERR_INVALID_CONFIG"
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
      } catch (e: Exception) {
        Log.e(TAG, "Failed to start payment: ${e.message}", e)
        promise.reject(ERROR_PAYMENT_INIT, "Failed to initialize payment: ${e.message}", e)
      }
    }

    /**
     * Close the current payment session
     */
    AsyncFunction("closePayment") { promise: Promise ->
      try {
        khalti?.close()
        khalti = null
        promise.resolve(mapOf("status" to "closed"))
      } catch (e: Exception) {
        Log.e(TAG, "Failed to close payment: ${e.message}", e)
        promise.reject("ERR_CLOSE_PAYMENT", "Failed to close payment: ${e.message}", e)
      }
    }

    /**
     * Get the current payment configuration
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
        promise.reject("ERR_GET_CONFIG", "Failed to get payment configuration: ${e.message}", e)
      }
    }
  }

  /**
   * Validate payment arguments before processing
   */
  private fun validatePaymentArgs(args: PaymentArgs) {
    if (args.publicKey.isBlank()) {
      throw IllegalArgumentException("Public key is required")
    }
    if (args.pidx.isBlank()) {
      throw IllegalArgumentException("PIDX is required")
    }
    if (args.publicKey.length < 10) {
      throw IllegalArgumentException("Invalid public key format")
    }
  }

  /**
   * Initialize payment with validated arguments
   */
  private fun initializePayment(args: PaymentArgs, promise: Promise) {
    val currentActivity = appContext.currentActivity
      ?: throw IllegalStateException("No current activity available")

    try {
      val environment = parseEnvironment(args.environment)
      val config = createPaymentConfig(args, environment)
      
      khalti = Khalti.init(
        currentActivity,
        config,
        onPaymentResult = { paymentResult, khalti ->
          handlePaymentResult(paymentResult, khalti, args, promise)
        },
        onMessage = { payload, khalti ->
          handlePaymentMessage(payload, khalti, args, promise)
        },
        onReturn = { khalti ->
          handlePaymentReturn(khalti)
        }
      )
      
      khalti?.open()
      Log.d(TAG, "Payment initialization successful for PIDX: ${args.pidx}")
      
    } catch (e: Exception) {
      Log.e(TAG, "Payment initialization failed: ${e.message}", e)
      throw e
    }
  }

  /**
   * Parse environment string to Environment enum
   */
  private fun parseEnvironment(environmentString: String): Environment {
    return when (environmentString.uppercase()) {
      "PROD", "PRODUCTION" -> Environment.PROD
      "TEST", "TESTING", "" -> Environment.TEST
      else -> {
        Log.w(TAG, "Unknown environment '$environmentString', defaulting to TEST")
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
   * Handle successful payment result
   */
  private fun handlePaymentResult(paymentResult: Any, khalti: Khalti, args: PaymentArgs, promise: Promise) {
    Log.d(TAG, "Payment result received: $paymentResult")
    
    try {
      khalti.close()
      
      val successData = mapOf(
        "pidx" to args.pidx,
        "status" to "completed",
        "paymentResult" to paymentResult.toString(),
        "timestamp" to System.currentTimeMillis()
      )
      
      sendEvent("onPaymentSuccess", successData)
      promise.resolve(successData)
      
    } catch (e: Exception) {
      Log.e(TAG, "Error handling payment result: ${e.message}", e)
      handlePaymentError("Failed to process payment result", e, promise)
    }
  }

  /**
   * Handle payment messages and errors
   */
  private fun handlePaymentMessage(payload: Any, khalti: Khalti, args: PaymentArgs, promise: Promise) {
    Log.w(TAG, "Payment message received: $payload")
    
    try {
      // Extract message details using reflection or toString parsing
      val messageStr = payload.toString()
      
      khalti.close()
      
      when {
        messageStr.contains("needsPaymentConfirmation", ignoreCase = true) -> {
          val successData = mapOf(
            "pidx" to args.pidx,
            "status" to "needs_verification",
            "message" to messageStr,
            "timestamp" to System.currentTimeMillis()
          )
          sendEvent("onPaymentSuccess", successData)
          promise.resolve(successData)
        }
        
        messageStr.contains("Disposed", ignoreCase = true) || 
        messageStr.contains("Cancel", ignoreCase = true) -> {
          Log.d(TAG, "Payment cancelled by user")
          sendEvent("onPaymentCancel", mapOf("reason" to "user_cancelled"))
          promise.reject(ERROR_PAYMENT_CANCELED, "Payment was cancelled by the user", null)
        }
        
        else -> {
          val errorData = mapOf(
            "error" to messageStr,
            "status" to "failed",
            "timestamp" to System.currentTimeMillis()
          )
          sendEvent("onPaymentError", errorData)
          promise.reject(ERROR_PAYMENT_FAILED, messageStr, null)
        }
      }
      
    } catch (e: Exception) {
      Log.e(TAG, "Error handling payment message: ${e.message}", e)
      handlePaymentError("Failed to process payment message", e, promise)
    }
  }

  /**
   * Handle return URL callback
   */
  private fun handlePaymentReturn(khalti: Khalti) {
    Log.d(TAG, "Payment return URL loaded successfully")
    // Optional: Send event to React Native if needed
  }

  /**
   * Handle payment errors consistently
   */
  private fun handlePaymentError(message: String, error: Throwable?, promise: Promise) {
    val errorData = mapOf(
      "error" to message,
      "status" to "failed",
      "timestamp" to System.currentTimeMillis(),
      "details" to (error?.message ?: "Unknown error")
    )
    
    sendEvent("onPaymentError", errorData)
    promise.reject(ERROR_PAYMENT_FAILED, message, error)
  }

  /**
   * Payment arguments data class
   * 
   * @property publicKey Khalti merchant public key
   * @property pidx Payment identifier from payment initiation
   * @property environment Payment environment (TEST or PROD)
   */
  class PaymentArgs : Record {
    @Field
    val publicKey: String = ""
    
    @Field
    val pidx: String = ""
    
    @Field
    val environment: String = "TEST"
  }
}
