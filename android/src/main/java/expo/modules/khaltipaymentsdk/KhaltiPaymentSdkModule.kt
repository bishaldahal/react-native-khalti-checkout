package expo.modules.khaltipaymentsdk

import android.util.Log
import com.khalti.checkout.Khalti
import com.khalti.checkout.data.Environment
import com.khalti.checkout.data.KhaltiPayConfig
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class KhaltiPaymentSdkModule : Module() {

  private var khalti: Khalti? = null

  override fun definition() = ModuleDefinition {
    Name("KhaltiPaymentSdk")

    Events("onPaymentSuccess", "onPaymentError", "onPaymentCancel")

    AsyncFunction("startPayment") { args: PaymentArgs, promise: Promise ->
      val currentActivity =
              appContext.currentActivity
                      ?: run {
                        promise.reject("ERR_NO_ACTIVITY", "No current activity", null)
                        return@AsyncFunction
                      }

      try {
        // Convert environment string to Environment enum
        val environment = when (args.environment.uppercase()) {
          "PROD", "PRODUCTION" -> Environment.PROD
          else -> Environment.TEST
        }
        
        val config = KhaltiPayConfig(
          publicKey = args.publicKey,
          pidx = args.pidx,
          environment = environment
        )

        khalti = Khalti.init(
          currentActivity, // context
          config,
          onPaymentResult = { paymentResult, khalti ->
            Log.d("KhaltiPayment", "Payment result: $paymentResult")
            // Close the payment interface
            khalti.close()
            
            // Parse payment result and send to React Native
            val successData = mapOf(
              "pidx" to args.pidx,
              "status" to "success",
              "paymentResult" to paymentResult.toString()
            )
            sendEvent("onPaymentSuccess", successData)
            promise.resolve(successData)
          },
          onMessage = { payload, khalti ->
            Log.w("KhaltiPayment", "Message received: ${payload.event} | ${payload.message} | needsConfirmation: ${payload.needsPaymentConfirmation}")
            
            // Print stack trace if there's an error
            payload.throwable?.printStackTrace()
            
            // Close the payment interface
            khalti.close()
            
            // Handle different message events
            when {
              payload.needsPaymentConfirmation -> {
                // This might be a successful payment that needs verification
                val successData = mapOf(
                  "pidx" to args.pidx,
                  "status" to "needs_verification",
                  "message" to payload.message
                )
                sendEvent("onPaymentSuccess", successData)
                promise.resolve(successData)
              }
              payload.event.name.contains("Disposed", ignoreCase = true) -> {
                Log.d("KhaltiPayment", "Payment cancelled by user")
                sendEvent("onPaymentCancel", null)
                promise.reject("PAYMENT_CANCELED", "Payment cancelled by the user", null)
              }
              else -> {
                val errorData = mapOf(
                  "error" to payload.message,
                  "status" to "failed",
                  "event" to payload.event.name
                )
                sendEvent("onPaymentError", errorData)
                promise.reject("PAYMENT_ERROR", payload.message, payload.throwable)
              }
            }
          },
          onReturn = { khalti ->
            Log.d("KhaltiPayment", "Return URL loaded successfully")
            // Optional callback - can be used for additional handling
          }
        )
        
        // Open the payment interface
        khalti?.open()
      } catch (e: Exception) {
        Log.e("KhaltiPayment", "Error initializing payment: ${e.message}")
        promise.reject("ERR_PAYMENT_INIT", "Failed to initialize payment: ${e.message}", e)
      }
    }
  }

  // Helper data class to receive structured args for new Khalti API
  class PaymentArgs : Record {
    @Field
    val publicKey: String = ""
    
    @Field
    val pidx: String = ""
    
    @Field
    val environment: String = "TEST" // "TEST" or "PROD"
  }
}
