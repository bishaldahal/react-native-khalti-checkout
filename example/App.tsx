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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { getKhaltiApiUrl } from "./config";

// Types
type KhaltiEnvironment = "TEST" | "PROD";

// Configuration for Khalti API
interface KhaltiConfig {
  publicKey: string;
  secretKey: string;
  environment: KhaltiEnvironment;
  returnUrl: string;
  websiteUrl: string;
}

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

// Default test configurations
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

export default function App() {
  // Configuration state
  const [isTestMode, setIsTestMode] = useState<boolean>(true);
  const [config, setConfig] = useState<KhaltiConfig>(DEFAULT_TEST_CONFIG);

  // Payment form state
  const [paymentStatus, setPaymentStatus] = useState<string>(
    "Ready to test payments"
  );
  const [amount, setAmount] = useState<string>("1000"); // Amount in paisa
  const [orderId, setOrderId] = useState<string>(`ORDER_${Date.now()}`);
  const [orderName, setOrderName] = useState<string>("Test Product");

  // Customer info state
  const [customerName, setCustomerName] = useState<string>("Test User");
  const [customerEmail, setCustomerEmail] =
    useState<string>("test@example.com");
  const [customerPhone, setCustomerPhone] = useState<string>("9800000000");

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState<boolean>(false);

  // Update config when test mode changes
  useEffect(() => {
    setConfig(isTestMode ? DEFAULT_TEST_CONFIG : DEFAULT_PROD_CONFIG);
  }, [isTestMode]);

  useEffect(() => {
    // Generate new order ID when component mounts
    setOrderId(`ORDER_${Date.now()}`);

    // Subscribe to payment events
    const successSubscription = KhaltiPaymentSdk.onPaymentSuccess((payload) => {
      const message = `Payment successful!\nPIDX: ${payload.pidx}\nStatus: ${payload.status}`;
      setPaymentStatus(message);
      Alert.alert("✅ Payment Success", message);
      setIsLoading(false);
    });

    const errorSubscription = KhaltiPaymentSdk.onPaymentError((payload) => {
      const message = `Payment failed: ${payload.error}`;
      setPaymentStatus(message);
      Alert.alert("❌ Payment Error", message);
      setIsLoading(false);
    });

    const cancelSubscription = KhaltiPaymentSdk.onPaymentCancel(() => {
      setPaymentStatus("Payment cancelled by user");
      Alert.alert("⚠️ Payment Cancelled", "User cancelled the payment");
      setIsLoading(false);
    });

    // Cleanup subscriptions on unmount
    return () => {
      successSubscription.remove();
      errorSubscription.remove();
      cancelSubscription.remove();
    };
  }, []);

  /**
   * Initiate payment by calling Khalti API
   * In production, this should be done from your secure backend server
   */
  const initiatePaymentWithKhalti = async (
    paymentData: PaymentInitRequest
  ): Promise<string> => {
    if (!config.secretKey) {
      throw new Error(
        "Secret key is required. Please configure your Khalti credentials."
      );
    }

    try {
      const KHALTI_API_URL = getKhaltiApiUrl(config.environment);

      console.log("Initiating payment with Khalti API...", {
        ...paymentData,
        environment: config.environment,
        api_url: KHALTI_API_URL,
      });

      const response = await fetch(KHALTI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `key ${config.secretKey}`,
        },
        body: JSON.stringify({
          return_url: config.returnUrl,
          website_url: config.websiteUrl,
          amount: paymentData.amount,
          purchase_order_id: paymentData.purchase_order_id,
          purchase_order_name: paymentData.purchase_order_name,
          customer_info: paymentData.customer_info,
        }),
      });

      console.log("Khalti API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Khalti API error response:", errorText);
        throw new Error(
          `Khalti API error! status: ${response.status}, message: ${errorText}`
        );
      }

      const data: PaymentInitResponse = await response.json();
      console.log("Khalti API response data:", data);

      if (!data.pidx) {
        throw new Error("Invalid response from Khalti: pidx not found");
      }

      return data.pidx;
    } catch (error) {
      console.error("Khalti payment initiation failed:", error);
      throw new Error(
        `Failed to initiate payment with Khalti: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const startPayment = async () => {
    try {
      setIsLoading(true);
      setPaymentStatus("Initiating payment...");

      // Validate required fields
      if (!config.publicKey) {
        throw new Error(
          "Public key is required. Please configure your Khalti credentials."
        );
      }

      if (!amount || parseInt(amount) <= 0) {
        throw new Error("Please enter a valid amount greater than 0");
      }

      if (!orderId.trim()) {
        throw new Error("Order ID is required");
      }

      if (!orderName.trim()) {
        throw new Error("Order name is required");
      }

      const paymentData: PaymentInitRequest = {
        amount: parseInt(amount),
        purchase_order_id: orderId.trim(),
        purchase_order_name: orderName.trim(),
        customer_info: {
          name: customerName.trim() || undefined,
          email: customerEmail.trim() || undefined,
          phone: customerPhone.trim() || undefined,
        },
      };

      console.log("Starting payment process with data:", paymentData);

      // Get pidx from Khalti API
      setPaymentStatus("Calling Khalti API to initiate payment...");
      const pidx = await initiatePaymentWithKhalti(paymentData);

      setPaymentStatus("Starting payment with Khalti SDK...");

      // Create payment arguments
      const paymentArgs: PaymentArgs = {
        publicKey: config.publicKey,
        pidx: pidx,
        environment: config.environment,
      };

      console.log("Starting payment with arguments:", paymentArgs);

      // Start payment with the obtained pidx
      const result = await KhaltiPaymentSdk.startPayment(paymentArgs);

      console.log("Payment initiated successfully:", result);
      setPaymentStatus(
        "Payment window opened. Complete payment in the Khalti interface."
      );
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setPaymentStatus(`Error: ${errorMessage}`);
      setIsLoading(false);
      Alert.alert("Payment Error", errorMessage);
    }
  };

  const resetForm = () => {
    setAmount("1000");
    setOrderId(`ORDER_${Date.now()}`);
    setOrderName("Test Product");
    setCustomerName("Test User");
    setCustomerEmail("test@example.com");
    setCustomerPhone("9800000000");
    setPaymentStatus("Ready to test payments");
    setIsLoading(false);
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Khalti Payment SDK</Text>
        <Text style={styles.subtitle}>Test Integration</Text>

        {/* Status Display */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={styles.statusText}>{paymentStatus}</Text>
        </View>

        {/* Environment Configuration */}
        <ConfigGroup title="Environment Configuration">
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Test Mode</Text>
            <Switch
              value={isTestMode}
              onValueChange={(value) => {
                setIsTestMode(value);
                if (!value && (!config.publicKey || !config.secretKey)) {
                  Alert.alert(
                    "Production Mode",
                    "Please configure your production keys before switching to production mode."
                  );
                }
              }}
              trackColor={{ false: "#767577", true: "#5C2D91" }}
              thumbColor={isTestMode ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <Text style={styles.environmentText}>
            Current Environment:{" "}
            <Text style={styles.bold}>{config.environment}</Text>
          </Text>

          <TouchableOpacity
            style={styles.configButton}
            onPress={() => setShowAdvancedConfig(!showAdvancedConfig)}
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
                isTestMode ? "test_public_key_xxx" : "live_public_key_xxx"
              }
              secureTextEntry={false}
            />

            <InputField
              label="Secret Key"
              value={config.secretKey}
              onChangeText={(text) =>
                setConfig((prev) => ({ ...prev, secretKey: text }))
              }
              placeholder={
                isTestMode ? "test_secret_key_xxx" : "live_secret_key_xxx"
              }
              secureTextEntry={true}
              warning="⚠️ In production, API calls should be made from your secure backend server"
            />

            <InputField
              label="Return URL"
              value={config.returnUrl}
              onChangeText={(text) =>
                setConfig((prev) => ({ ...prev, returnUrl: text }))
              }
              placeholder="https://yourwebsite.com/payment/"
            />

            <InputField
              label="Website URL"
              value={config.websiteUrl}
              onChangeText={(text) =>
                setConfig((prev) => ({ ...prev, websiteUrl: text }))
              }
              placeholder="https://yourwebsite.com"
            />
          </ConfigGroup>
        )}

        {/* Payment Form */}
        <ConfigGroup title="Payment Details">
          <InputField
            label="Amount (in paisa)*"
            value={amount}
            onChangeText={setAmount}
            placeholder="1000 (= Rs. 10)"
            keyboardType="numeric"
            info="100 paisa = 1 NPR"
          />

          <InputField
            label="Order ID*"
            value={orderId}
            onChangeText={setOrderId}
            placeholder="ORDER_12345"
          />

          <InputField
            label="Order Name*"
            value={orderName}
            onChangeText={setOrderName}
            placeholder="Product or service name"
          />
        </ConfigGroup>

        {/* Customer Information */}
        <ConfigGroup title="Customer Information">
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
          />

          <InputField
            label="Customer Phone"
            value={customerPhone}
            onChangeText={setCustomerPhone}
            placeholder="98XXXXXXXX"
            keyboardType="phone-pad"
          />
        </ConfigGroup>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={resetForm}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Reset Form</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={startPayment}
            disabled={isLoading || !config.publicKey}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? "Processing..." : "Start Payment"}
            </Text>
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
            purposes. In production, payment initiation should be done from your
            secure backend server.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Khalti Payment SDK v{require("../package.json").version}
          </Text>
          <Text style={styles.footerText}>Platform: {Platform.OS}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components
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
  info?: string;
  warning?: string;
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  info,
  warning,
}: InputFieldProps) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {info && <Text style={styles.infoTextSmall}>{info}</Text>}
      {warning && <Text style={styles.warningTextSmall}>{warning}</Text>}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    marginTop: 20,
    marginBottom: 5,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center" as const,
    marginBottom: 20,
    color: "#666",
  },
  statusContainer: {
    margin: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#5C2D91",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  group: {
    margin: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    fontSize: 18,
    fontWeight: "bold" as const,
    marginBottom: 15,
    color: "#333",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  switchContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 15,
    paddingVertical: 5,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  environmentText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },
  bold: {
    fontWeight: "bold" as const,
    color: "#5C2D91",
  },
  configButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center" as const,
  },
  configButtonText: {
    color: "#5C2D91",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  actionButtons: {
    flexDirection: "row" as const,
    gap: 10,
    margin: 15,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  primaryButton: {
    backgroundColor: "#5C2D91",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#5C2D91",
  },
  buttonDisabled: {
    backgroundColor: "#999",
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold" as const,
  },
  secondaryButtonText: {
    color: "#5C2D91",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  infoBox: {
    margin: 15,
    padding: 15,
    backgroundColor: "#e8f4fd",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bee5eb",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#0c5460",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#0c5460",
    lineHeight: 20,
    marginBottom: 10,
  },
  infoTextSmall: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    fontStyle: "italic" as const,
  },
  warningText: {
    fontSize: 14,
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#fff3cd",
    borderRadius: 5,
    color: "#856404",
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  warningTextSmall: {
    fontSize: 12,
    color: "#d1a000",
    marginTop: 5,
    fontStyle: "italic" as const,
  },
  footer: {
    alignItems: "center" as const,
    padding: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center" as const,
  },
};
