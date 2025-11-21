import React, { useEffect, useState } from "react";
import AppNavigator from "./src/navigation/Navigator";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./src/firebaseConfig";

export default function App() {
  const [user, setUser] = useState<User | null>(null); // ✅ FIXED TYPING
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // now works
      setLoading(false);
    });

    return unsub;
  }, []);

  if (loading) return null;

  return <AppNavigator user={user} />;
}
