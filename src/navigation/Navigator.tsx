import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import type { User } from "firebase/auth";

// Screens
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";
import AddMemberScreen from "../screens/MembersScreen";
import AssignChoreScreen from "../screens/AssignChoreScreen";
import ChoreHistoryScreen from "../screens/ChoreHistoryScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ----------------------------
// MAIN TABS AFTER LOGIN
// ----------------------------
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: "#2563eb" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },

        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "gray",

        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          switch (route.name) {
            case "Dashboard":
              iconName = "home-outline";
              break;
            case "Add Member":
              iconName = "person-add-outline";
              break;
            case "Assign Chore":
              iconName = "list-outline";
              break;
            case "Chore History":
              iconName = "time-outline";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Add Member" component={AddMemberScreen} />
      <Tab.Screen name="Assign Chore" component={AssignChoreScreen} />
      <Tab.Screen name="Chore History" component={ChoreHistoryScreen} />
    </Tab.Navigator>
  );
}

// ----------------------------
// AUTH SCREENS (LOGIN + SIGNUP)
// ----------------------------
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// ----------------------------
// FINAL NAVIGATOR WITH PROPER TYPE
// ----------------------------
export default function AppNavigator({ user }: { user: User | null }) {
  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
