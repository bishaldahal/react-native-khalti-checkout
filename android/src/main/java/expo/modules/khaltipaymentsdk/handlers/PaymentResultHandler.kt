package expo.modules.khaltipaymentsdk.handlers

import android.util.Log
import com.khalti.checkout.Khalti
import com.khalti.checkout.data.PaymentResult
import com.khalti.checkout.resource.OnMessageEvent
import com.khalti.checkout.resource.OnMessagePayload
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.khaltipaymentsdk.constants.KhaltiConstants
import expo.modules.khaltipaymentsdk.exceptions.PaymentCanceledException
import expo.modules.khaltipaymentsdk.exceptions.PaymentFailedException
import expo.modules.khaltipaymentsdk.models.PaymentArgs

/**
 * Handles payment callbacks and events from Khalti SDK.
 */
class PaymentResultHandler(private val module: Module) {

  /**
   * Handles payment result from Khalti SDK.
   */
  fun handlePaymentResult(paymentResult: PaymentResult, khalti: Khalti, args: PaymentArgs, promise: Promise) {
    Log.d(KhaltiConstants.TAG, "Payment result: ${paymentResult.status}, Transaction ID: ${paymentResult.payload?.transactionId}")

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
      module.sendEvent(KhaltiConstants.EVENT_PAYMENT_SUCCESS, successData)
      promise.resolve(successData)
    } catch (e: Exception) {
      handlePaymentError("Failed to process payment result", e, promise)
    }
  }

  /**
   * Handles payment messages (e.g., errors, cancellations) from Khalti SDK.
   */
  fun handlePaymentMessage(payload: OnMessagePayload, khalti: Khalti, args: PaymentArgs, promise: Promise) {
    Log.w(KhaltiConstants.TAG, "Payment message: ${payload.event}, Code: ${payload.code}, Message: ${payload.message}")
    try {
      khalti.close()
      when (payload.event) {
        OnMessageEvent.KPGDisposed -> {
          val cancelData = mapOf(
            "pidx" to args.pidx,
            "reason" to "user_cancelled",
            "timestamp" to System.currentTimeMillis()
          )
          module.sendEvent(KhaltiConstants.EVENT_PAYMENT_CANCEL, cancelData)
          promise.reject(PaymentCanceledException())
        }
        OnMessageEvent.ReturnUrlLoadFailure, OnMessageEvent.NetworkFailure -> {
          val errorData = mapOf(
            "pidx" to args.pidx,
            "error" to payload.message,
            "status" to "failed",
            "code" to payload.code,
            "event" to payload.event,
            "timestamp" to System.currentTimeMillis()
          )
          module.sendEvent(KhaltiConstants.EVENT_PAYMENT_ERROR, errorData)
          promise.reject(PaymentFailedException(payload.message, payload.throwable))
        }
        OnMessageEvent.PaymentLookUpFailure -> {
          val errorMessage = "Payment lookup failed" 
          val errorData = mapOf(
            "pidx" to args.pidx,
            "error" to errorMessage,
            "status" to "failed",
            "code" to payload.code,
            "event" to payload.event,
            "timestamp" to System.currentTimeMillis()
          )
          module.sendEvent(KhaltiConstants.EVENT_PAYMENT_ERROR, errorData)
          promise.reject(PaymentFailedException(message=errorMessage, payload.throwable))
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
          module.sendEvent(KhaltiConstants.EVENT_PAYMENT_ERROR, errorData)
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
            module.sendEvent(KhaltiConstants.EVENT_PAYMENT_SUCCESS, successData)
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
            module.sendEvent(KhaltiConstants.EVENT_PAYMENT_ERROR, errorData)
            promise.reject(PaymentFailedException(payload.message, payload.throwable))
          }
        }
      }
    } catch (e: Exception) {
      Log.e(KhaltiConstants.TAG, "Error handling payment message: ${e.message}", e)
      handlePaymentError("Failed to process payment message", e, promise)
    }
  }

  /**
   * Handles return URL callback from Khalti.
   */
  fun handlePaymentReturn(@Suppress("UNUSED_PARAMETER") khalti: Khalti) {
    Log.d(KhaltiConstants.TAG, "Payment return URL loaded")
    // Optional: Send event to React Native if needed
    // module.sendEvent("onPaymentReturn", mapOf("status" to "return_url_loaded"))
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
    module.sendEvent(KhaltiConstants.EVENT_PAYMENT_ERROR, errorData)
    promise.reject(PaymentFailedException(message, error))
  }
}
