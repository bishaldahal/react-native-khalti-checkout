package expo.modules.khaltipaymentsdk

import android.util.Log
import com.khalti.checkout.helper.Config
import com.khalti.checkout.helper.KhaltiCheckOut
import com.khalti.checkout.helper.OnCancelListener
import com.khalti.checkout.helper.OnCheckOutListener
import com.khalti.checkout.helper.PaymentPreference
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class KhaltiPaymentSdkModule : Module() {

  private var checkout: KhaltiCheckOut? = null

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
        val config =
                Config.Builder(
                                args.publicKey,
                                args.productId,
                                args.productName,
                                args.amount.toLong(), // Convert Double to Long for paisa
                                object : OnCheckOutListener {
                                  override fun onSuccess(data: Map<String, Any>) {
                                    Log.d("KhaltiPayment", "Payment successful: $data")
                                    sendEvent("onPaymentSuccess", data)
                                    promise.resolve(data)
                                  }

                                  override fun onError(
                                          action: String,
                                          errorMap: Map<String, String>
                                  ) {
                                    Log.e(
                                            "KhaltiPayment",
                                            "Payment error - Action: $action, Error: $errorMap"
                                    )
                                    val errorData =
                                            mapOf("action" to action, "errorMap" to errorMap)
                                    sendEvent("onPaymentError", errorData)
                                    promise.reject(
                                            "PAYMENT_ERROR",
                                            "Payment was unsuccessful: $errorMap",
                                            null
                                    )
                                  }
                                }
                        )
                        // .paymentPreferences(listOf(PaymentPreference.KHALTI, PaymentPreference.MOBILE,))
                        .onCancel(
                                object : OnCancelListener {
                                  override fun onCancel() {
                                    Log.d("KhaltiPayment", "Payment cancelled by user")
                                    sendEvent("onPaymentCancel", null)
                                    promise.reject(
                                            "PAYMENT_CANCELED",
                                            "Payment cancelled by the user",
                                            null
                                    )
                                  }
                                }
                        )

        // Add optional parameters if provided
        args.productUrl?.let { config.productUrl(it) }
        args.additionalData?.let { config.additionalData(it) }

        val finalConfig = config.build()

        checkout = KhaltiCheckOut(currentActivity, finalConfig)
        checkout?.show()
      } catch (e: Exception) {
        Log.e("KhaltiPayment", "Error initializing payment: ${e.message}")
        promise.reject("ERR_PAYMENT_INIT", "Failed to initialize payment: ${e.message}", e)
      }
    }
  }

  // Helper data class to receive structured args
  class PaymentArgs : Record {
    @Field
    val publicKey: String = ""
    
    @Field
    val productId: String = ""
    
    @Field
    val productName: String = ""
    
    @Field
    val amount: Double = 0.0
    
    @Field
    val productUrl: String? = null
    
    @Field
    val additionalData: Map<String, Any>? = null
  }
}
