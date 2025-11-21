import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

export default function MembersScreen() {
  const [members, setMembers] = useState<any[]>([]);
  const [name, setName] = useState("");

  const user = auth.currentUser!;
  const uid = user.uid;

  // Real-time user-specific members
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "users", uid, "members"),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMembers(data);
      }
    );
    return () => unsub();
  }, []);

  const addMember = async () => {
    if (!name.trim()) return;

    await addDoc(collection(db, "users", uid, "members"), {
      name,
      addedBy: uid,
      addedByEmail: user.email,
      createdAt: new Date().toISOString(),
    });

    setName("");
  };

  const removeMember = async (id: string) => {
    await deleteDoc(doc(db, "users", uid, "members", id));
  };

  // Colors for alternating cards
  const cardColors = ["#eef2ff", "#e0f2fe", "#dcfce7", "#fef9c3"];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👨‍👩 Add Family Members</Text>

      {/* Add Member Card */}
      <View style={styles.addCard}>
        <Text style={styles.label}>Member Name</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Enter a name"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addMember}>
            <Text style={styles.addBtnText}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Members List */}
      {members.length === 0 ? (
        <Text style={styles.noMembers}>No members yet. Add one!</Text>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.card,
                { backgroundColor: cardColors[index % cardColors.length] },
              ]}
            >
              <View style={styles.leftRow}>
                <Text style={styles.icon}>👤</Text>
                <View>
                  <Text style={styles.memberName}>{item.name}</Text>

                  {/* SHOW WHO ADDED MEMBER */}
                  <Text style={styles.addedBy}>
                    Added by: {item.addedByEmail || "Unknown"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeMember(item.id)}
              >
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#111",
    marginBottom: 14,
  },

  addCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  label: {
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111",
  },

  addBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginLeft: 10,
  },

  addBtnText: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },

  noMembers: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 40,
    fontSize: 16,
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  leftRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    fontSize: 20,
    marginRight: 8,
  },

  memberName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },

  addedBy: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  removeBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  removeBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
});
