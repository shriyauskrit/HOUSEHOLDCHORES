import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, StyleSheet } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; // ✅ make sure path is correct
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const [chores, setChores] = useState<any[]>([]);
  const navigation = useNavigation<any>(); // ✅ allows navigate() without TS errors

  useEffect(() => {
    const fetchChores = async () => {
      const querySnapshot = await getDocs(collection(db, "chores"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChores(data);
    };
    fetchChores();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏡 Household Chores</Text>

      {/* ✅ fixed screen name (no space) */}
      <Button title="Add Chore" onPress={() => navigation.navigate("AddChore")} />

      <FlatList
        data={chores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.choreItem}>
            <Text style={styles.choreText}>{item.name}</Text>
            <Text>{item.assignedTo}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  choreItem: {
    padding: 10,
    backgroundColor: "#f2f2f2",
    marginBottom: 5,
    borderRadius: 8,
  },
  choreText: { fontSize: 18 },
});
