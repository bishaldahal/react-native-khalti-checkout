import { useEvent } from "expo";
import KhaltiPaymentSdk from "khalti-payment-sdk";
import {
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";

export default function App() {
  const [paymentStatus, setPaymentStatus] = useState<string>("Ready");
  
  const onPaymentSuccess = useEvent(KhaltiPaymentSdk, "onPaymentSuccess");
  const onPaymentError = useEvent(KhaltiPaymentSdk, "onPaymentError");
  const onPaymentCancel = useEvent(KhaltiPaymentSdk, "onPaymentCancel");

  // Handle payment events
  if (onPaymentSuccess) {
    setPaymentStatus(`Payment Success: ${JSON.stringify(onPaymentSuccess)}`);
    Alert.alert("Payment Success", JSON.stringify(onPaymentSuccess, null, 2));
  }

  if (onPaymentError) {
    setPaymentStatus(`Payment Error: ${JSON.stringify(onPaymentError)}`);
    Alert.alert("Payment Error", JSON.stringify(onPaymentError, null, 2));
  }

  if (onPaymentCancel) {
    setPaymentStatus("Payment Cancelled");
    Alert.alert("Payment Cancelled", "User cancelled the payment");
  }

  const startPayment = async () => {
    try {
      setPaymentStatus("Starting payment...");
      
      // Note: In a real app, you need to get pidx from your backend by calling
      // the Khalti payment initiation API first. This is just for demo purposes.
      const result = await KhaltiPaymentSdk.startPayment({
        publicKey: "f84d5a579518492d94e345e02311e733", // Use your actual public key
        pidx: "P3Ur4xSzGecSjSaPnRFr6F", // This should come from payment initiation API
        environment: "TEST", // Use "TEST" or "PROD"
      });
      console.log("Payment result:", result);
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus(`Error: ${error}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Group name="Khalti Payment SDK Test">
          <Text style={styles.status}>Status: {paymentStatus}</Text>
          <TouchableOpacity style={styles.button} onPress={startPayment}>
            <Text style={styles.buttonText}>Start Payment (Test)</Text>
          </TouchableOpacity>
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold' as const,
  },
  group: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
  view: {
    flex: 1,
    height: 200,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#5C2D91",
    padding: 15,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
};
