import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function AddChoreScreen() {
  const [name, setName] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const navigation = useNavigation();

  const addChore = async () => {
    if (!name.trim() || !assignedTo.trim()) return;
    await addDoc(collection(db, "chores"), {
      name,
      assignedTo,
      createdAt: new Date(),
    });
    setName("");
    setAssignedTo("");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a New Chore</Text>
      <TextInput
        placeholder="Chore name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Assigned to"
        value={assignedTo}
        onChangeText={setAssignedTo}
        style={styles.input}
      />
      <Button title="Add Chore" onPress={addChore} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
});
