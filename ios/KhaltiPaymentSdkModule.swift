import ExpoModulesCore
import KhaltiCheckout
import UIKit

/// Expo module for integrating Khalti Payment Gateway in React Native/Expo applications.
///
/// This module provides a native iOS interface for Khalti's checkout-ios SDK, enabling
/// seamless payment processing for Nepalese merchants. It supports payments via Khalti wallet,
/// eBanking, mobile banking, and cards.
///
/// @author Bishal Dahal
/// @version 0.1.0
/// @since 0.1.0
public class KhaltiPaymentSdkModule: Module {

  // MARK: - Properties

  private var khalti: Khalti?
  private let paymentResultHandler = PaymentResultHandler()

  // MARK: - Module Definition

  public func definition() -> ModuleDefinition {
    Name("KhaltiPaymentSdk")

    // Initialize the result handler with this module
    OnCreate {
      self.paymentResultHandler.module = self
    }

    // Define events that can be emitted to React Native
    Events(
      KhaltiConstants.eventPaymentSuccess,
      KhaltiConstants.eventPaymentError,
      KhaltiConstants.eventPaymentCancel
    )

    /**
     * Initialize and start payment process
     *
     * @param args PaymentArgs containing publicKey, pidx, and environment
     * @param promise Promise to resolve/reject based on payment outcome
     */
    AsyncFunction("startPayment") { (args: PaymentArgs, promise: Promise) in
      do {
        AppLogger.d(KhaltiConstants.tag, "Starting payment with pidx: \(args.pidx)")

        // Validate arguments
        try PaymentUtils.validatePaymentArgs(args)

        // Initialize payment on main thread
        DispatchQueue.main.async {
          self.initializePayment(args, promise)
        }
      } catch {
        AppLogger.e(
          KhaltiConstants.tag, "Failed to start payment: \(error.localizedDescription)", error)
        promise.reject(PaymentInitException())
      }
    }

    /**
     * Closes the current Khalti payment session.
     *
     * @param promise Resolves with a confirmation or rejects if closing fails.
     */
    AsyncFunction("closePayment") { (promise: Promise) in
      DispatchQueue.main.async {
        do {
          self.khalti?.close()
          self.khalti = nil
          let result = ["status": "closed"]
          promise.resolve(result)
          AppLogger.d("PaymentSession", "Payment session closed successfully")
        } catch {
          AppLogger.e(
            "PaymentSession", "Failed to close payment: \(error.localizedDescription)", error)
          promise.reject(PaymentFailedException())
        }
      }
    }

    /**
     * Retrieves the current Khalti payment configuration.
     *
     * @param promise Resolves with the configuration or null if none exists.
     */
    AsyncFunction("getPaymentConfig") { (promise: Promise) in
      do {
        guard let config = self.khalti?.config else {
          promise.resolve(nil)
          return
        }

        let configData: [String: Any] = [
          "publicKey": config.publicKey,
          "pidx": config.pIdx,
          "environment": config.environment == .PROD ? "PROD" : "TEST",
        ]

        promise.resolve(configData)
      } catch {
        AppLogger.e(
          KhaltiConstants.tag, "Failed to get payment config: \(error.localizedDescription)", error)
        promise.reject(InvalidConfigException())
      }
    }

    // Clean up on module destruction
    OnDestroy {
      DispatchQueue.main.async {
        self.khalti?.close()
        self.khalti = nil
        AppLogger.d("ModuleLifecycle", "KhaltiPaymentSdkModule destroyed")
      }
    }
  }

  // MARK: - Private Methods

  /**
   * Initializes a Khalti payment session.
   */
  private func initializePayment(_ args: PaymentArgs, _ promise: Promise) {
    guard let rootViewController = UIApplication.shared.windows.first?.rootViewController else {
      promise.reject(NoViewControllerException())
      return
    }

    do {
      let environment = PaymentUtils.parseEnvironment(args.environment)
      let config = PaymentUtils.createPaymentConfig(args, environment)

      // Get the topmost view controller for presentation
      let presentingViewController = getTopViewController(rootViewController)

      // Initialize Khalti with config and callbacks
      khalti = Khalti(
        config: config,
        onPaymentResult: { [weak self] paymentResult, khaltiInstance in
          self?.paymentResultHandler.handlePaymentResult(
            paymentResult, khaltiInstance, args, promise)
        },
        onMessage: { [weak self] payload, khaltiInstance in
          self?.paymentResultHandler.handlePaymentMessage(payload, khaltiInstance, args, promise)
        },
        onReturn: { [weak self] khaltiInstance in
          self?.paymentResultHandler.handlePaymentReturn(khaltiInstance)
        }
      )

      // Open payment interface
      khalti?.open(viewController: presentingViewController)

      AppLogger.d(
        "PaymentInit",
        "Payment initialized for PIDX: \(args.pidx), Environment: \(args.environment)")
    } catch {
      AppLogger.e(
        "PaymentInit", "Payment initialization failed: \(error.localizedDescription)", error)
      promise.reject(PaymentInitException())
    }
  }

  /**
   * Gets the topmost view controller for presenting the payment interface
   */
  private func getTopViewController(_ base: UIViewController) -> UIViewController {
    if let nav = base as? UINavigationController {
      return getTopViewController(nav.visibleViewController ?? nav.topViewController ?? base)
    }
    if let tab = base as? UITabBarController {
      if let selected = tab.selectedViewController {
        return getTopViewController(selected)
      }
    }
    if let presented = base.presentedViewController {
      return getTopViewController(presented)
    }
    return base
  }
}

// MARK: - PaymentArgs Record

/// Payment arguments for configuring Khalti payment.
struct PaymentArgs: Record {
  @Field var publicKey: String = ""
  @Field var pidx: String = ""
  @Field var environment: String = "TEST"
}
