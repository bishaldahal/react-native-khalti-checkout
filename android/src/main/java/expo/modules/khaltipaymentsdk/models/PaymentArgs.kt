package expo.modules.khaltipaymentsdk.models

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

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
  val environment: String = "TEST"
}
