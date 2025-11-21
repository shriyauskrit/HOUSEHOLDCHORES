import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import AddMemberScreen from "../screens/MembersScreen";
import AssignChoreScreen from "../screens/AssignChoreScreen";
import ChoreHistoryScreen from "../screens/ChoreHistoryScreen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: "#fff", borderTopWidth: 0.5 },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Home") iconName = "home";
          else if (route.name === "AddMember") iconName = "people";
          else if (route.name === "AssignChore") iconName = "list";
          else if (route.name === "History") iconName = "calendar";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="AddMember" component={AddMemberScreen} options={{ title: "Members" }} />
      <Tab.Screen name="AssignChore" component={AssignChoreScreen} options={{ title: "Assign" }} />
      <Tab.Screen name="History" component={ChoreHistoryScreen} />
    </Tab.Navigator>
  );
}
