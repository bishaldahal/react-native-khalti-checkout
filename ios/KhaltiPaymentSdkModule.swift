import ExpoModulesCore

public class KhaltiPaymentSdkModule: Module {
  public func definition() -> ModuleDefinition {
    Name("KhaltiPaymentSdk")

    // Define the events that can be sent to JavaScript
    Events("onPaymentSuccess", "onPaymentError", "onPaymentCancel")

    // Define the startPayment async function
    AsyncFunction("startPayment") { (args: PaymentArgs, promise: Promise) in
      // For now, we'll reject with a not implemented error
      // You'll need to integrate the actual Khalti iOS SDK here
      promise.reject("NOT_IMPLEMENTED", "iOS implementation not yet available", nil)
    }

    // Define the closePayment async function  
    AsyncFunction("closePayment") { (promise: Promise) in
      promise.reject("NOT_IMPLEMENTED", "iOS implementation not yet available", nil)
    }

    // Define the getPaymentConfig async function
    AsyncFunction("getPaymentConfig") { (promise: Promise) in
      promise.reject("NOT_IMPLEMENTED", "iOS implementation not yet available", nil)
    }

    // Enable view component
    View(KhaltiPaymentSdkView.self) {
      Prop("url") { (view: KhaltiPaymentSdkView, url: URL) in
        if view.webView.url != url {
          view.webView.load(URLRequest(url: url))
        }
      }

      Events("onLoad")
    }
  }
}

// Define the PaymentArgs record for iOS
struct PaymentArgs: Record {
  @Field var publicKey: String = ""
  @Field var pidx: String = ""
  @Field var environment: String = "TEST"
}
