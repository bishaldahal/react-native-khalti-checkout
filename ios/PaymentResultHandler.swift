import ExpoModulesCore
import Foundation
import KhaltiCheckout

/// Handles payment callbacks and events from Khalti SDK
class PaymentResultHandler {
    weak var module: KhaltiPaymentSdkModule?

    /**
     * Handles payment result from Khalti SDK
     */
    func handlePaymentResult(
        _ paymentResult: PaymentResult, _ khalti: Khalti?, _ args: PaymentArgs, _ promise: Promise
    ) {
        AppLogger.d(
            "PaymentResult",
            "Payment result: \(paymentResult.status ?? "N/A"), Transaction ID: \(paymentResult.payload?.transactionId ?? "N/A")"
        )

        // Ensure UI operations happen on main thread
        DispatchQueue.main.async {
            do {
                khalti?.close()
                let payload = paymentResult.payload
                let successData: [String: Any?] = [
                    "pidx": payload?.pidx,
                    "status": paymentResult.status,
                    "transactionId": payload?.transactionId,
                    "totalAmount": payload?.totalAmount,
                    "fee": payload?.fee,
                    "refunded": payload?.refunded,
                    "purchaseOrderId": payload?.purchaseOrderId,
                    "purchaseOrderName": payload?.purchaseOrderName,
                    "extraMerchantParams": payload?.extraMerchantParams,
                    "timestamp": Int64(Date().timeIntervalSince1970 * 1000),
                ]

                self.module?.sendEvent(KhaltiConstants.eventPaymentSuccess, successData)
                promise.resolve(successData)
            } catch {
                self.handlePaymentError("Failed to process payment result", error, promise)
            }
        }
    }

    /**
     * Handles payment messages (e.g., errors, cancellations) from Khalti SDK.
     */
    func handlePaymentMessage(
        _ payload: OnMessagePayload, _ khalti: Khalti?, _ args: PaymentArgs, _ promise: Promise
    ) {
        AppLogger.w(
            "PaymentMessage",
            "Payment message: \(payload.event), Code: \(payload.code ?? 0), Message: \(payload.message)"
        )

        // Ensure UI operations happen on main thread
        DispatchQueue.main.async {
            do {
                khalti?.close()
                switch payload.event {
                case .KPGDisposed:
                    let cancelData: [String: Any] = [
                        "pidx": args.pidx,
                        "reason": "user_cancelled",
                        "timestamp": Int64(Date().timeIntervalSince1970 * 1000),
                    ]
                    self.module?.sendEvent(KhaltiConstants.eventPaymentCancel, cancelData)
                    promise.reject(PaymentCanceledException())

                case .ReturnUrlLoadFailure, .NetworkFailure:
                    let errorData: [String: Any] = [
                        "pidx": args.pidx,
                        "error": payload.message,
                        "status": "failed",
                        "code": payload.code ?? 0,
                        "event": "\(payload.event)",
                        "timestamp": Int64(Date().timeIntervalSince1970 * 1000),
                    ]
                    self.module?.sendEvent(KhaltiConstants.eventPaymentError, errorData)
                    promise.reject(PaymentFailedException())

                case .PaymentLookUpFailure:
                    let errorMessage = "Payment lookup failed"
                    let errorData: [String: Any] = [
                        "pidx": args.pidx,
                        "error": errorMessage,
                        "status": "failed",
                        "code": payload.code ?? 0,
                        "event": "\(payload.event)",
                        "timestamp": Int64(Date().timeIntervalSince1970 * 1000),
                    ]
                    self.module?.sendEvent(KhaltiConstants.eventPaymentError, errorData)
                    promise.reject(PaymentFailedException())

                case .Unknown:
                    let errorData: [String: Any] = [
                        "pidx": args.pidx,
                        "error": payload.message,
                        "status": "failed",
                        "code": payload.code ?? 0,
                        "event": "\(payload.event)",
                        "timestamp": Int64(Date().timeIntervalSince1970 * 1000),
                    ]
                    self.module?.sendEvent(KhaltiConstants.eventPaymentError, errorData)
                    promise.reject(PaymentFailedException())

                @unknown default:
                    if payload.needsPaymentConfirmation {
                        let successData: [String: Any] = [
                            "pidx": args.pidx,
                            "status": "needs_verification",
                            "message": payload.message,
                            "code": payload.code ?? 0,
                            "timestamp": Int64(Date().timeIntervalSince1970 * 1000),
                        ]
                        self.module?.sendEvent(KhaltiConstants.eventPaymentSuccess, successData)
                        promise.resolve(successData)
                    } else {
                        let errorData: [String: Any] = [
                            "pidx": args.pidx,
                            "error": payload.message,
                            "status": "failed",
                            "code": payload.code ?? 0,
                            "event": "\(payload.event)",
                            "timestamp": Int64(Date().timeIntervalSince1970 * 1000),
                        ]
                        self.module?.sendEvent(KhaltiConstants.eventPaymentError, errorData)
                        promise.reject(PaymentFailedException())
                    }
                }
            } catch {
                AppLogger.e(
                    "PaymentMessage", "Error handling payment message: \(error.localizedDescription)",
                    error)
                self.handlePaymentError("Failed to process payment message", error, promise)
            }
        }
    }

    /**
     * Handles return URL callback from Khalti.
     */
    func handlePaymentReturn(_ khalti: Khalti?) {
        AppLogger.d("PaymentReturn", "Payment return URL loaded")
        // Optional: Send event to React Native if needed
        // module?.sendEvent("onPaymentReturn", ["status": "return_url_loaded"])
    }

    /**
     * Handles payment errors consistently.
     */
    private func handlePaymentError(_ message: String, _ error: Error, _ promise: Promise) {
        DispatchQueue.main.async {
            let errorData: [String: Any] = [
                "error": message,
                "status": "failed",
                "timestamp": Int64(Date().timeIntervalSince1970 * 1000),
                "details": error.localizedDescription,
            ]
            self.module?.sendEvent(KhaltiConstants.eventPaymentError, errorData)
            promise.reject(PaymentFailedException())
        }
    }
}
