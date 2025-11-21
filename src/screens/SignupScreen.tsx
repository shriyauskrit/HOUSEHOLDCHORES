import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { setDoc, doc } from "firebase/firestore";

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCred.user.uid;

      // ----------------------------
      // 🔥 CREATE MAIN USER DOC
      // ----------------------------
      await setDoc(doc(db, "users", uid), {
        email,
        createdAt: new Date().toISOString(),
      });

      // ----------------------------
      // 🔥 CREATE appConfig/system DOC
      // ----------------------------
      await setDoc(doc(db, "users", uid, "appConfig", "system"), {
        lastResetDate: new Date().toDateString(),
      });

      Alert.alert("Success", "Account created!");
      navigation.navigate("Login");
    } catch (e: any) {
      Alert.alert("Signup Error", e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Create Account ✨</Text>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter a password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text
          style={styles.footerLink}
          onPress={() => navigation.navigate("Login")}
        >
          Already have an account?{" "}
          <Text style={styles.linkBold}>Log In</Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#4f46e5",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
  card: {
    marginTop: 40,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    backgroundColor: "#f9fafb",
  },
  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
  footerLink: {
    marginTop: 16,
    textAlign: "center",
    color: "#6b7280",
  },
  linkBold: {
    color: "#4f46e5",
    fontWeight: "700",
  },
});
