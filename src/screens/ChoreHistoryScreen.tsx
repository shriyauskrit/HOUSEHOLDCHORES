import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function ChoreHistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const uid = auth.currentUser!.uid;

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, "users", uid, "choreHistory"),
            orderBy("timestamp", "desc")
          )
        );

        const arr = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setHistory(arr);
      } catch (e) {
        console.log("History load error:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📅 Chore History</Text>

      {history.length === 0 && (
        <Text style={styles.noHistory}>No history available yet.</Text>
      )}

      {history.map((entry) => (
        <View key={entry.id} style={styles.card}>
          <View style={styles.dateRow}>
            <Text style={styles.dateIcon}>🗓️</Text>
            <Text style={styles.dateText}>{entry.date}</Text>
          </View>

          {/* 🔥 Loop chore items */}
          {entry.chores.map((chore: any, index: number) => (
            <View key={index} style={styles.row}>
              <View style={{ flex: 1 }}>
                {/* Chore name */}
                <Text style={styles.choreName}>
                  • {chore.name.length > 22 ? chore.name.slice(0, 22) + "..." : chore.name}
                </Text>

                {/* Assigned To */}
                <Text style={styles.assignedTo}>
                  Assigned to: <Text style={{ fontWeight: "600" }}>{chore.assignedTo}</Text>
                </Text>

                {/* Completed By (optional) */}
                {chore.completed && chore.completedByName && (
                  <Text style={styles.doneBy}>
                    ✔ Completed by: {chore.completedByName}
                  </Text>
                )}
              </View>

              {/* Status */}
              <Text
                style={chore.completed ? styles.statusDone : styles.statusPending}
              >
                {chore.completed ? "Done" : "Not Done"}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9fafb",
    flex: 1,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#111827",
  },

  noHistory: {
    textAlign: "center",
    marginTop: 50,
    color: "#6b7280",
    fontSize: 16,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  dateIcon: { fontSize: 18, marginRight: 8 },

  dateText: { fontSize: 18, fontWeight: "700", color: "#1f2937" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  choreName: { fontSize: 16, color: "#374151", fontWeight: "500" },

  assignedTo: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 2,
  },

  doneBy: {
    color: "#4b5563",
    fontSize: 12,
    marginTop: 2,
  },

  statusDone: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "700",
    marginLeft: 8,
    alignSelf: "center",
  },

  statusPending: {
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "700",
    marginLeft: 8,
    alignSelf: "center",
  },
});
