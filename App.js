import { useState, useContext, useEffect } from "react";
import { LogBox, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { RootSiblingParent } from "react-native-root-siblings";

import { UserContext, UserProvider } from "./context/UserContext";
import { firebaseConfig } from "./config/firebaseConfig";

import HomeScreen from "./screens/HomeScreen";
import DetailsScreen from "./screens/DetailsScreen";
import SearchScreen from "./screens/SearchScreen";
import ReviewEventsScreen from "./screens/ReviewEventsScreen";
import AddEventScreen from "./screens/AddEventScreen";
import LoginScreen from "./screens/LoginScreen";
import MyAccountScreen from "./screens/MyAccountScreen";

const Stack = createNativeStackNavigator();

LogBox.ignoreLogs(["Warning: ..."]); // Ignore log notification by message
LogBox.ignoreAllLogs();

function App() {
  // Initialize Firebase
  initializeApp(firebaseConfig);
  const { state, dispatch } = useContext(UserContext);
  console.log("state in App.js", state);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const listener = onAuthStateChanged(auth, async (user) => {
      console.log("onAuthStateChanged user", user);
      if (user) {
        console.log("signed in");
        setIsAuthenticated(true);
      } else {
        console.log("not signed in");
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => {
      listener();
    };
  }, []);

  return isLoading ? (
    <Text>Loading ...</Text>
  ) : (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false, headerBackTitleVisible: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={() => ({
            title: "Login",
            headerShown: true,
          })}
        />
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={({ route }) => ({
            title: route.params?.title || "Event Details",
            headerShown: true,
          })}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={({ route }) => ({
            title: route.params?.category || route.params?.timeName || "Search",
            headerShown: true,
          })}
        />
        <Stack.Screen
          name="ReviewEvents"
          component={ReviewEventsScreen}
          options={() => ({
            title: "Review Events",
            headerShown: true,
          })}
        />
        <Stack.Screen
          name="AddEvent"
          component={AddEventScreen}
          options={({ route }) => ({
            title: route.params?.title || "Add New Event",
            headerShown: true,
          })}
        />
        <Stack.Screen
          name="MyAccount"
          component={MyAccountScreen}
          options={() => ({
            title: "My Account",
            headerShown: true,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default () => {
  return (
    <UserProvider>
      <RootSiblingParent>
        <App />
      </RootSiblingParent>
    </UserProvider>
  );
};
