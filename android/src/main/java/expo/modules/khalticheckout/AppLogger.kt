package expo.modules.khalticheckout

import android.util.Log

object AppLogger {

    private const val MAIN_TAG = "KhaltiPaymentSdk"
    private val isLoggingEnabled = BuildConfig.DEBUG

    fun v(subTag: String, message: String, throwable: Throwable? = null) {
        if (isLoggingEnabled) log(Log.VERBOSE, subTag, message, throwable)
    }

    fun d(subTag: String, message: String, throwable: Throwable? = null) {
        if (isLoggingEnabled) log(Log.DEBUG, subTag, message, throwable)
    }

    fun i(subTag: String, message: String, throwable: Throwable? = null) {
        if (isLoggingEnabled) log(Log.INFO, subTag, message, throwable)
    }

    fun w(subTag: String, message: String, throwable: Throwable? = null) {
        if (isLoggingEnabled) log(Log.WARN, subTag, message, throwable)
    }

    fun e(subTag: String, message: String, throwable: Throwable? = null) {
        if (isLoggingEnabled) log(Log.ERROR, subTag, message, throwable)
    }
    private fun log(priority: Int, subTag: String, message: String, throwable: Throwable?) {
        val formattedMessage = "[$subTag] $message"
        if (throwable != null) {
            Log.println(priority, MAIN_TAG, "$formattedMessage\n${Log.getStackTraceString(throwable)}")
        } else {
            Log.println(priority, MAIN_TAG, formattedMessage)
        }
    }
}
