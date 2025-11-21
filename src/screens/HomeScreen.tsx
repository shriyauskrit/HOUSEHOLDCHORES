import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  addDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import * as Progress from "react-native-progress";
import { db, auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";

type Chore = {
  docId: string;
  name: string;
  assignedTo: string;
  completed?: boolean | null;
  completedBy?: string | null;
  completedByName?: string | null;
  date?: string;
};

export default function HomeScreen() {
  const [choresByMember, setChoresByMember] = useState<Record<string, Chore[]>>({});
  const [members, setMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");

  const uid = auth.currentUser!.uid;

  useEffect(() => {
    const formatted = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    setToday(formatted);
  }, []);

  // Load member list
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users", uid, "members"), (snap) => {
      const names = snap.docs.map((d) => d.data().name);
      setMembers(names);
    });
    return () => unsub();
  }, []);

  // Load chores
  useEffect(() => {
    handleSharedDailyReset();

    const unsub = onSnapshot(
      collection(db, "users", uid, "chores"),
      (snapshot) => {
        const allChores: Chore[] = snapshot.docs.map((docSnap) => ({
          docId: docSnap.id,
          ...(docSnap.data() as Omit<Chore, "docId">),
        }));

        const todays = allChores.filter((c) => c.date === today);

        const grouped: Record<string, Chore[]> = {};
        todays.forEach((chore) => {
          const member = chore.assignedTo || "Unassigned";
          if (!grouped[member]) grouped[member] = [];
          grouped[member].push(chore);
        });

        setChoresByMember(grouped);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [today]);

  // Daily reset logic
  const handleSharedDailyReset = async () => {
    try {
      const systemDoc = doc(db, "users", uid, "appConfig", "system");
      const todayStr = new Date().toDateString();
      const snap = await getDoc(systemDoc);

      if (!snap.exists()) {
        await setDoc(systemDoc, { lastResetDate: todayStr });
        return;
      }

      if (snap.data().lastResetDate !== todayStr) {
        await archiveAndResetChores(todayStr);
        await updateDoc(systemDoc, { lastResetDate: todayStr });
      }
    } catch (e) {
      console.log("reset error:", e);
    }
  };

  // archive and clear today's chores
  const archiveAndResetChores = async (todayStr: string) => {
    const choresSnap = await getDocs(collection(db, "users", uid, "chores"));

    const chores = choresSnap.docs.map((d) => ({
      docId: d.id,
      ...(d.data() as Omit<Chore, "docId">),
    }));

    if (chores.length > 0) {
      await addDoc(collection(db, "users", uid, "choreHistory"), {
        date: todayStr,
        chores,
        timestamp: new Date(),
      });
    }

    // Reset complete status
    for (const c of choresSnap.docs) {
      await updateDoc(c.ref, {
        completed: null,
        completedBy: null,
        completedByName: null,
      });
    }
  };

  // Mark chore completed/uncompleted
  const toggleComplete = async (docId: string, current: boolean | null, memberName: string) => {
    const newState = !current;

    await updateDoc(doc(db, "users", uid, "chores", docId), {
      completed: newState,
      completedBy: newState ? uid : null,
      completedByName: newState ? memberName : null,
    });
  };

  const handleLogout = async () => signOut(auth);

  if (loading)
    return <Text style={{ marginTop: 50, textAlign: "center" }}>Loading…</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>🏡 Daily Chores Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.dateText}>📅 {today}</Text>

      <FlatList
        data={members}
        keyExtractor={(m) => m}
        renderItem={({ item: member, index }) => {
          const chores = choresByMember[member] || [];
          const total = chores.length;
          const completed = chores.filter((c) => c.completed).length;
          const progress = total ? completed / total : 0;

          return (
            <View
              style={[
                styles.memberCard,
                { backgroundColor: ["#fce7f3", "#dbeafe", "#dcfce7"][index % 3] },
              ]}
            >
              <Text style={styles.memberName}>👤 {member}</Text>

              {total === 0 ? (
                <Text>No chores today.</Text>
              ) : (
                <>
                  <Progress.Bar
                    progress={progress}
                    width={150}
                    color="#2563eb"
                    style={{ marginVertical: 6 }}
                  />

                  {chores.map((c) => (
                    <TouchableOpacity
                      key={c.docId}
                      onPress={() => toggleComplete(c.docId, c.completed ?? false, member)}
                    >
                      <Text
                        style={[
                          styles.choreText,
                          c.completed && styles.completedChore,
                        ]}
                      >
                        • {c.name} {c.completed ? "✅" : "⬜"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9fafb" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "700" },
  dateText: { color: "#666", marginBottom: 10 },
  logoutButton: {
    backgroundColor: "red",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: { color: "#fff", fontWeight: "bold" },
  memberCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  memberName: { fontWeight: "bold", fontSize: 18 },
  choreText: { fontSize: 16 },
  completedChore: { textDecorationLine: "line-through", color: "#999" },
});
