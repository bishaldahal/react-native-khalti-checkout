import KhaltiPaymentSdk, { PaymentArgs } from "khalti-payment-sdk";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getKhaltiApiUrl, validateConfig, type KhaltiConfig } from "./config";
import {
  validateEmail,
  validatePhone,
  validateAmount,
  generateOrderId,
  paisaToNPR,
  isEmpty,
} from "./utils";
import {
  DEFAULT_FORM_VALUES,
  PAYMENT_LIMITS,
  ERROR_MESSAGES,
  STATUS_MESSAGES,
  ALERTS,
  COLORS,
} from "./constants";

// Types for payment initiation
interface PaymentInitRequest {
  amount: number; // in paisa (1 NPR = 100 paisa)
  purchase_order_id: string;
  purchase_order_name: string;
  customer_info?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

interface PaymentInitResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
}

interface FormErrors {
  amount?: string;
  orderId?: string;
  orderName?: string;
  customerEmail?: string;
  customerPhone?: string;
  config?: string[];
}

// Enhanced default configurations
const DEFAULT_TEST_CONFIG: KhaltiConfig = {
  publicKey: "b9288a8a24c144e389d012ce992eea58",
  secretKey: "8472e5a3a43541e6ba54e623d17f8c95",
  environment: "TEST",
  returnUrl: "https://example.com/payment/",
  websiteUrl: "https://example.com",
};

const DEFAULT_PROD_CONFIG: KhaltiConfig = {
  publicKey: "",
  secretKey: "",
  environment: "PROD",
  returnUrl: "https://yourwebsite.com/payment/",
  websiteUrl: "https://yourwebsite.com",
};

/**
 * Main App Component - Khalti Payment SDK Demo
 *
 * This component demonstrates the integration of Khalti Payment SDK
 */
export default function App() {
  // Configuration state
  const [isTestMode, setIsTestMode] = useState<boolean>(true);
  const [config, setConfig] = useState<KhaltiConfig>(DEFAULT_TEST_CONFIG);

  // Payment form state
  const [paymentStatus, setPaymentStatus] = useState<string>(
    STATUS_MESSAGES.READY
  );
  const [amount, setAmount] = useState<string>(DEFAULT_FORM_VALUES.AMOUNT);
  const [orderId, setOrderId] = useState<string>(generateOrderId());
  const [orderName, setOrderName] = useState<string>(
    DEFAULT_FORM_VALUES.ORDER_NAME
  );

  // Customer info state
  const [customerName, setCustomerName] = useState<string>(
    DEFAULT_FORM_VALUES.CUSTOMER_NAME
  );
  const [customerEmail, setCustomerEmail] = useState<string>(
    DEFAULT_FORM_VALUES.CUSTOMER_EMAIL
  );
  const [customerPhone, setCustomerPhone] = useState<string>(
    DEFAULT_FORM_VALUES.CUSTOMER_PHONE
  );

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const scrollViewRef = useRef<ScrollView>(null);

  const isFormValid = useMemo(() => {
    return (
      Object.keys(formErrors).length === 0 &&
      config.publicKey.trim() !== "" &&
      amount.trim() !== "" &&
      orderId.trim() !== "" &&
      orderName.trim() !== ""
    );
  }, [formErrors, config.publicKey, amount, orderId, orderName]);

  const amountInNPR = useMemo(() => {
    return paisaToNPR(amount);
  }, [amount]);

  const validateForm = useCallback((): FormErrors => {
    const errors: FormErrors = {};

    if (isEmpty(amount)) {
      errors.amount = ERROR_MESSAGES.AMOUNT_REQUIRED;
    } else if (!validateAmount(amount)) {
      errors.amount = ERROR_MESSAGES.AMOUNT_INVALID;
    }

    if (isEmpty(orderId)) {
      errors.orderId = ERROR_MESSAGES.ORDER_ID_REQUIRED;
    } else if (orderId.trim().length < PAYMENT_LIMITS.MIN_ORDER_ID_LENGTH) {
      errors.orderId = ERROR_MESSAGES.ORDER_ID_TOO_SHORT;
    }

    if (isEmpty(orderName)) {
      errors.orderName = ERROR_MESSAGES.ORDER_NAME_REQUIRED;
    } else if (orderName.trim().length < PAYMENT_LIMITS.MIN_ORDER_NAME_LENGTH) {
      errors.orderName = ERROR_MESSAGES.ORDER_NAME_TOO_SHORT;
    }

    if (!isEmpty(customerEmail) && !validateEmail(customerEmail.trim())) {
      errors.customerEmail = ERROR_MESSAGES.EMAIL_INVALID;
    }

    if (!isEmpty(customerPhone) && !validatePhone(customerPhone.trim())) {
      errors.customerPhone = ERROR_MESSAGES.PHONE_INVALID;
    }

    // Config validation
    const configValidation = validateConfig(config);
    if (!configValidation.isValid) {
      errors.config = configValidation.errors;
    }

    return errors;
  }, [amount, orderId, orderName, customerEmail, customerPhone, config]);

  useEffect(() => {
    const errors = validateForm();
    setFormErrors(errors);
  }, [validateForm]);

  useEffect(() => {
    const newConfig = isTestMode ? DEFAULT_TEST_CONFIG : DEFAULT_PROD_CONFIG;
    setConfig(newConfig);
  }, [isTestMode]);

  // Initialize component and set up event listeners
  useEffect(() => {
    setOrderId(generateOrderId());

    const successSubscription = KhaltiPaymentSdk.onPaymentSuccess((payload) => {
      try {
        const message = `✅ Payment Successful!\n\nPIDX: ${payload.pidx}\nStatus: ${payload.status}\nTimestamp: ${new Date(payload.timestamp || Date.now()).toLocaleString()}`;
        setPaymentStatus(message);
        Alert.alert(ALERTS.PAYMENT_SUCCESS, message, [
          {
            text: "OK",
            onPress: () => setPaymentStatus(STATUS_MESSAGES.READY_FOR_NEXT),
          },
        ]);
      } catch (error) {
        console.error("Error handling payment success:", error);
      } finally {
        setIsLoading(false);
      }
    });

    const errorSubscription = KhaltiPaymentSdk.onPaymentError((payload) => {
      try {
        const message = `❌ Payment Failed\n\nError: ${payload.error}\nDetails: ${payload.details || "No additional details"}\nTimestamp: ${new Date(payload.timestamp || Date.now()).toLocaleString()}`;
        setPaymentStatus(message);
        Alert.alert(ALERTS.PAYMENT_ERROR, message, [
          {
            text: "OK",
            onPress: () => setPaymentStatus(STATUS_MESSAGES.READY_TO_RETRY),
          },
        ]);
      } catch (error) {
        console.error("Error handling payment error:", error);
      } finally {
        setIsLoading(false);
      }
    });

    const cancelSubscription = KhaltiPaymentSdk.onPaymentCancel((payload) => {
      try {
        const message = `⚠️ Payment Cancelled\n\nReason: ${payload?.reason || "User cancelled the payment"}\nTimestamp: ${new Date(payload?.timestamp || Date.now()).toLocaleString()}`;
        setPaymentStatus(message);
        Alert.alert(ALERTS.PAYMENT_CANCELLED, message, [
          {
            text: "OK",
            onPress: () => setPaymentStatus(STATUS_MESSAGES.READY_FOR_NEW),
          },
        ]);
      } catch (error) {
        console.error("Error handling payment cancellation:", error);
      } finally {
        setIsLoading(false);
      }
    });

    // Cleanup subscriptions on unmount
    return () => {
      try {
        successSubscription.remove();
        errorSubscription.remove();
        cancelSubscription.remove();
      } catch (error) {
        console.error("Error cleaning up subscriptions:", error);
      }
    };
  }, []);

  /**
   * Note: In production, this should be done from your backend server
   */
  const initiatePaymentWithKhalti = useCallback(
    async (paymentData: PaymentInitRequest): Promise<string> => {
      if (!config.secretKey) {
        throw new Error(
          "Secret key is required. Please configure your Khalti credentials."
        );
      }

      try {
        const KHALTI_API_URL = getKhaltiApiUrl(config.environment);

        console.log("🚀 Initiating payment with Khalti API...", {
          ...paymentData,
          environment: config.environment,
          api_url: KHALTI_API_URL,
        });

        const requestBody = {
          return_url: config.returnUrl,
          website_url: config.websiteUrl,
          amount: paymentData.amount,
          purchase_order_id: paymentData.purchase_order_id,
          purchase_order_name: paymentData.purchase_order_name,
          customer_info: paymentData.customer_info,
        };

        const response = await fetch(KHALTI_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `key ${config.secretKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        console.log("📡 Khalti API response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Khalti API error response:", errorText);

          let errorMessage = `API Error (${response.status})`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage =
              errorData.detail || errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }

          throw new Error(errorMessage);
        }

        const data: PaymentInitResponse = await response.json();
        console.log("✅ Khalti API response data:", data);

        if (!data.pidx) {
          throw new Error("Invalid response from Khalti: pidx not found");
        }

        return data.pidx;
      } catch (error) {
        console.error("💥 Khalti payment initiation failed:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        throw new Error(`Failed to initiate payment: ${errorMessage}`);
      }
    },
    [config]
  );

  const startPayment = useCallback(async () => {
    try {
      setIsLoading(true);
      setPaymentStatus(STATUS_MESSAGES.VALIDATING);

      // Validate form before proceeding
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        const errorMessages = [
          ...Object.values(errors).filter((error) => typeof error === "string"),
          ...(errors.config || []),
        ];
        throw new Error(`Validation failed:\n${errorMessages.join("\n")}`);
      }

      // Prepare customer info (only include non-empty values)
      const customerInfo: PaymentInitRequest["customer_info"] = {};
      if (customerName.trim()) customerInfo.name = customerName.trim();
      if (customerEmail.trim()) customerInfo.email = customerEmail.trim();
      if (customerPhone.trim()) customerInfo.phone = customerPhone.trim();

      const paymentData: PaymentInitRequest = {
        amount: parseInt(amount, 10),
        purchase_order_id: orderId.trim(),
        purchase_order_name: orderName.trim(),
        customer_info:
          Object.keys(customerInfo).length > 0 ? customerInfo : undefined,
      };

      console.log("💳 Starting payment process with data:", paymentData);

      // Get pidx from Khalti API
      setPaymentStatus(STATUS_MESSAGES.CALLING_API);
      const pidx = await initiatePaymentWithKhalti(paymentData);

      setPaymentStatus(STATUS_MESSAGES.OPENING_SDK);

      // Create payment arguments for SDK
      const paymentArgs: PaymentArgs = {
        publicKey: config.publicKey,
        pidx: pidx,
        environment: config.environment,
      };

      console.log("🎯 Starting payment with SDK arguments:", paymentArgs);

      // Start payment with the obtained pidx
      await KhaltiPaymentSdk.startPayment(paymentArgs);

      setPaymentStatus(
        "⏳ Payment window opened. Complete payment in the Khalti interface."
      );
    } catch (error) {
      console.error("💥 Payment error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      setPaymentStatus(`❌ Error: ${errorMessage}`);
      setIsLoading(false);

      Alert.alert(ALERTS.PAYMENT_ERROR, errorMessage, [
        {
          text: "OK",
          onPress: () => setPaymentStatus("Ready to retry payment"),
        },
      ]);
    }
  }, [
    amount,
    orderId,
    orderName,
    customerName,
    customerEmail,
    customerPhone,
    config,
    validateForm,
    initiatePaymentWithKhalti,
  ]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setAmount(DEFAULT_FORM_VALUES.AMOUNT);
    setOrderId(generateOrderId());
    setOrderName(DEFAULT_FORM_VALUES.ORDER_NAME);
    setCustomerName(DEFAULT_FORM_VALUES.CUSTOMER_NAME);
    setCustomerEmail(DEFAULT_FORM_VALUES.CUSTOMER_EMAIL);
    setCustomerPhone(DEFAULT_FORM_VALUES.CUSTOMER_PHONE);
    setPaymentStatus(STATUS_MESSAGES.READY);
    setIsLoading(false);
    setFormErrors({});
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  /**
   * Handle test mode toggle with validation
   */
  const handleTestModeToggle = useCallback(
    (value: boolean) => {
      setIsTestMode(value);
      if (!value && (!config.publicKey || !config.secretKey)) {
        Alert.alert(
          ALERTS.PRODUCTION_MODE,
          ALERTS.PRODUCTION_MODE_MESSAGE,
          [{ text: "OK" }]
        );
      }
    },
    [config.publicKey, config.secretKey]
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <SafeAreaView
        style={styles.container}
        edges={["top", "left", "right", "bottom"]}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.header}>Khalti Payment SDK</Text>
              <Text style={styles.subtitle}>Integration Demo</Text>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>
                  v{require("../package.json").version} • {Platform.OS}
                </Text>
              </View>
            </View>

            {/* Status Display */}
            <View
              style={[
                styles.statusContainer,
                isLoading && styles.statusLoading,
              ]}
            >
              <View style={styles.statusHeader}>
                <Text style={styles.statusLabel}>Status</Text>
                {isLoading && (
                  <ActivityIndicator size="small" color="#5C2D91" />
                )}
              </View>
              <Text style={styles.statusText}>{paymentStatus}</Text>
              {amountInNPR > 0 && (
                <Text style={styles.amountPreview}>
                  Amount: {amount} paisa (NPR {amountInNPR.toFixed(2)})
                </Text>
              )}
            </View>

            {/* Environment Configuration */}
            <ConfigGroup title="Environment Configuration">
              <View style={styles.switchContainer}>
                <View style={styles.switchLabelContainer}>
                  <Text style={styles.switchLabel}>Test Mode</Text>
                  <Text style={styles.switchDescription}>
                    {isTestMode
                      ? "Safe testing environment"
                      : "Live production mode"}
                  </Text>
                </View>
                <Switch
                  value={isTestMode}
                  onValueChange={handleTestModeToggle}
                  trackColor={{ false: "#767577", true: "#5C2D91" }}
                  thumbColor={isTestMode ? "#ffffff" : "#f4f3f4"}
                  accessibilityLabel="Toggle test mode"
                />
              </View>

              <View style={styles.environmentDisplay}>
                <Text style={styles.environmentText}>
                  Current Environment:{" "}
                  <Text style={styles.bold}>{config.environment}</Text>
                </Text>
                {formErrors.config && (
                  <View style={styles.errorContainer}>
                    {formErrors.config.map((error, index) => (
                      <Text key={index} style={styles.errorText}>
                        • {error}
                      </Text>
                    ))}
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.configButton}
                onPress={() => setShowAdvancedConfig(!showAdvancedConfig)}
                accessibilityLabel={`${showAdvancedConfig ? "Hide" : "Show"} advanced configuration`}
              >
                <Text style={styles.configButtonText}>
                  {showAdvancedConfig ? "Hide" : "Show"} Advanced Configuration
                </Text>
              </TouchableOpacity>
            </ConfigGroup>

            {/* Advanced Configuration */}
            {showAdvancedConfig && (
              <ConfigGroup title="Khalti Configuration">
                <InputField
                  label="Public Key"
                  value={config.publicKey}
                  onChangeText={(text) =>
                    setConfig((prev) => ({ ...prev, publicKey: text }))
                  }
                  placeholder={
                    isTestMode ? "test_public_key" : "live_public_key"
                  }
                  secureTextEntry={false}
                  required
                />

                <InputField
                  label="Secret Key"
                  value={config.secretKey}
                  onChangeText={(text) =>
                    setConfig((prev) => ({ ...prev, secretKey: text }))
                  }
                  placeholder={
                    isTestMode ? "test_secret_key" : "live_secret_key"
                  }
                  secureTextEntry={true}
                  required
                  warning="⚠️ In production, API calls should be made from your backend server"
                />

                <InputField
                  label="Return URL"
                  value={config.returnUrl}
                  onChangeText={(text) =>
                    setConfig((prev) => ({ ...prev, returnUrl: text }))
                  }
                  placeholder="https://yourwebsite.com/payment/"
                  autoCapitalize="none"
                  required
                />

                <InputField
                  label="Website URL"
                  value={config.websiteUrl}
                  onChangeText={(text) =>
                    setConfig((prev) => ({ ...prev, websiteUrl: text }))
                  }
                  placeholder="https://yourwebsite.com"
                  autoCapitalize="none"
                  required
                />
              </ConfigGroup>
            )}

            {/* Payment Form */}
            <ConfigGroup title="Payment Details">
              <InputField
                label="Amount (in paisa)"
                value={amount}
                onChangeText={setAmount}
                placeholder="1000 (= NPR 10.00)"
                keyboardType="numeric"
                info={`100 paisa = 1 NPR • Max: ${(PAYMENT_LIMITS.MAX_AMOUNT / 100).toLocaleString()} NPR`}
                required
                error={formErrors.amount}
              />

              <InputField
                label="Order ID"
                value={orderId}
                onChangeText={setOrderId}
                placeholder="ORDER_12345"
                info="Unique identifier for this order"
                required
                error={formErrors.orderId}
              />

              <InputField
                label="Order Name"
                value={orderName}
                onChangeText={setOrderName}
                placeholder="Product or service name"
                info="Description of what the customer is purchasing"
                required
                error={formErrors.orderName}
              />
            </ConfigGroup>

            {/* Customer Information */}
            <ConfigGroup title="Customer Information (Optional)">
              <InputField
                label="Customer Name"
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="John Doe"
              />

              <InputField
                label="Customer Email"
                value={customerEmail}
                onChangeText={setCustomerEmail}
                placeholder="john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={formErrors.customerEmail}
              />

              <InputField
                label="Customer Phone"
                value={customerPhone}
                onChangeText={setCustomerPhone}
                placeholder="9800000000"
                keyboardType="phone-pad"
                info="Nepal mobile number format: 9XXXXXXXX"
                error={formErrors.customerPhone}
              />
            </ConfigGroup>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={resetForm}
                disabled={isLoading}
                accessibilityLabel="Reset form to default values"
              >
                <Text style={styles.secondaryButtonText}>Reset Form</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  (isLoading || !isFormValid) && styles.buttonDisabled,
                ]}
                onPress={startPayment}
                disabled={isLoading || !isFormValid}
                accessibilityLabel={
                  isFormValid
                    ? "Start payment process"
                    : "Fix form errors to enable payment"
                }
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.primaryButtonText}>Processing...</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryButtonText}>Start Payment</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Information Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>💡 How to use this demo:</Text>
              <Text style={styles.infoText}>
                1. Toggle Test/Production mode{"\n"}
                2. Configure your Khalti keys in advanced settings{"\n"}
                3. Fill in payment details{"\n"}
                4. Tap "Start Payment" to test the integration{"\n"}
                5. Complete payment in the Khalti interface
              </Text>

              <Text style={styles.infoTitle}>🔒 Security Note:</Text>
              <Text style={styles.infoText}>
                This demo calls Khalti API directly from the app for testing
                purposes. In production, payment initiation should be done from
                your backend server.
              </Text>

              <Text style={styles.infoTitle}>📱 Supported Platforms:</Text>
              <Text style={styles.infoText}>
                • iOS 12.0 and above{"\n"}• Android API 21 and above{"\n"}• Web
                browsers with modern JavaScript support
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

// Enhanced helper components
function ConfigGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{title}</Text>
      {children}
    </View>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  info?: string;
  warning?: string;
  error?: string;
  required?: boolean;
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  autoCapitalize = "none",
  info,
  warning,
  error,
  required = false,
}: InputFieldProps) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.requiredMark}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        accessibilityLabel={label}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {info && !error && <Text style={styles.infoTextSmall}>{info}</Text>}
      {warning && !error && (
        <Text style={styles.warningTextSmall}>{warning}</Text>
      )}
    </View>
  );
}

const styles = {
  // Layout styles
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // Header styles
  headerSection: {
    alignItems: "center" as const,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: "700" as const,
    textAlign: "center" as const,
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center" as const,
    color: "#6c757d",
    marginBottom: 12,
  },
  versionBadge: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  versionText: {
    fontSize: 12,
    color: "#6c757d",
    fontWeight: "500" as const,
  },

  // Status styles
  statusContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#5C2D91",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statusLoading: {
    borderLeftColor: "#ffc107",
  },
  statusHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1a1a1a",
  },
  statusText: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 22,
    marginBottom: 8,
  },
  amountPreview: {
    fontSize: 14,
    color: "#5C2D91",
    fontWeight: "600" as const,
    backgroundColor: "#f8f4ff",
    padding: 8,
    borderRadius: 6,
    textAlign: "center" as const,
  },

  // Group styles
  group: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  groupHeader: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 20,
    color: "#1a1a1a",
  },

  // Form styles
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 8,
    color: "#1a1a1a",
  },
  requiredMark: {
    color: "#dc3545",
    fontWeight: "700" as const,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#1a1a1a",
  },
  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#fff5f5",
  },

  // Switch styles
  switchContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
    paddingVertical: 8,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: "#6c757d",
  },

  // Environment styles
  environmentDisplay: {
    marginBottom: 16,
  },
  environmentText: {
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 8,
  },
  bold: {
    fontWeight: "700" as const,
    color: "#5C2D91",
  },

  // Button styles
  configButton: {
    backgroundColor: "#f8f9fa",
    padding: 14,
    borderRadius: 8,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  configButtonText: {
    color: "#5C2D91",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  actionButtons: {
    flexDirection: "row" as const,
    gap: 12,
    margin: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    minHeight: 50,
  },
  primaryButton: {
    backgroundColor: "#5C2D91",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#5C2D91",
  },
  buttonDisabled: {
    backgroundColor: "#adb5bd",
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  secondaryButtonText: {
    color: "#5C2D91",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  loadingContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },

  // Info box styles
  infoBox: {
    margin: 16,
    padding: 20,
    backgroundColor: "#e8f4fd",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bee5eb",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#0c5460",
    marginBottom: 8,
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#0c5460",
    lineHeight: 22,
    marginBottom: 8,
  },

  // Error and info text styles
  errorContainer: {
    backgroundColor: "#fff5f5",
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#dc3545",
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#dc3545",
    marginTop: 6,
    fontWeight: "500" as const,
  },
  infoTextSmall: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 6,
    fontStyle: "italic" as const,
  },
  warningTextSmall: {
    fontSize: 12,
    color: "#e67e22",
    marginTop: 6,
    fontStyle: "italic" as const,
    fontWeight: "500" as const,
  },
};
