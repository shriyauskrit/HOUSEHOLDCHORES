import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, addDoc } from "firebase/firestore";

type Member = { id: string; name: string };

export default function AssignChoreScreen() {
  const [choreName, setChoreName] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");

  const uid = auth.currentUser!.uid;

  // Format today's date
  useEffect(() => {
    const formatted = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    setToday(formatted);
  }, []);

  // Load members from: users / uid / members
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const snap = await getDocs(collection(db, "users", uid, "members"));
        const list: Member[] = snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
        }));
        setMembers(list);
      } catch (e) {
        Alert.alert("Error loading members", String(e));
      } finally {
        setLoading(false);
      }
    };
    loadMembers();
  }, []);

  // Save chore inside user folder
  const handleAssign = async () => {
    const trimmed = choreName.trim();

    if (!trimmed || !assignedTo) {
      return Alert.alert("Missing Info", "Please fill out all fields.");
    }

    try {
      await addDoc(collection(db, "users", uid, "chores"), {
        name: trimmed,
        assignedTo,
        completed: null,
        createdAt: new Date().toISOString(),
        date: today,
        createdBy: uid, // 🔥 helps track the owner
      });

      Alert.alert("Success!", "Chore assigned.");
      setChoreName("");
      setAssignedTo("");
    } catch (e) {
      Alert.alert("Error assigning chore", String(e));
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={{ textAlign: "center" }}>Loading members…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>🧹 Assign a Chore</Text>
      <Text style={styles.date}>{today}</Text>

      <View style={styles.card}>
        {/* Chore Name */}
        <Text style={styles.label}>Chore Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter chore"
          placeholderTextColor="#888"
          value={choreName}
          onChangeText={setChoreName}
        />

        {/* Member Picker */}
        <Text style={styles.label}>Assign To</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={assignedTo}
            onValueChange={setAssignedTo}
            style={styles.picker}
          >
            <Picker.Item label="Select member" value="" />
            {members.map((m) => (
              <Picker.Item key={m.id} label={m.name} value={m.name} />
            ))}
          </Picker>
        </View>

        {/* Button */}
        <TouchableOpacity style={styles.button} onPress={handleAssign}>
          <Text style={styles.buttonText}>Assign Chore</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#111",
  },
  date: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    elevation: 2,
  },
  label: { fontWeight: "700", marginTop: 10, color: "#333" },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    marginTop: 6,
  },
  picker: { height: 44 },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
});
