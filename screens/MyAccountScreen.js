import { useContext } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Button,
  Alert,
} from "react-native";
import axios from "axios";
import {
  getAuth,
  signOut,
} from "firebase/auth";

import PrimaryButton from "../components/PrimaryButton";
import { UserContext } from "../context/UserContext";

import {
  SERVER_API_URL,
  API_URL_EVENT,
  API_URL_APPROVE,
} from "../config/config";

export default function MyAccountScreen({ navigation }) {
  const { state, dispatch } = useContext(UserContext);

  const updateProfile = async () => {
    console.log("updateProfile");
    const endPoint = `${SERVER_API_URL}${API_URL_EVENT}${API_URL_APPROVE}/${id}`;
    const payload = {};
    console.log("endpoint", endPoint);
    try {
      const { data } = await axios.post(endPoint, payload);
      console.log("data", data);
      navigation.navigate("Home");
    } catch (error) {
      console.log("error", error);
    }
  };

  const deleteProfile = async () => {
    console.log("deleteProfile");
    try {
      const auth = getAuth();
      const user = auth?.currentUser;
      if(user)
      {
        Alert.alert('Are you sure you want to delete your account permanently?', 'Deleting your account will remove all of your information from our database. This cannot be undone', [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'Delete Account', 
            onPress: () => {
              console.log('Delete Account Pressed');
              user.delete();
              console.log("user deleted");
              signOut(auth);
              console.log("user logged out");
              dispatch({ type: "Logout" });
              setTimeout(function () {
                navigation.navigate("Login");
              }, 1000);
            }
          },
        ]);

      }
      else{
        console.log("Invalid user. Unable to delete!!");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.containerView}>
        <View style={styles.eventDetails}>
          <Text style={styles.eventName}>Role: {state.userType}</Text>
          <View style={styles.row}>
            <Image source={require("../assets/images/mobile.png")} />
            <View style={styles.details}>
              <Text style={styles.detailsHeading}>Phone Number</Text>
              <Text style={styles.detailsInfo}>{state.phoneNumber}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Image source={require("../assets/images/id-card.png")} />
            <View style={styles.details}>
              <Text style={styles.detailsHeading}>UID</Text>
              <Text style={styles.detailsInfo}>{state.user?.uid}</Text>
            </View>
          </View>
        </View>
        <View style={styles.secondaryButton}>
          <Button title="Delete My Account" onPress={deleteProfile} />
        </View>
      </ScrollView>
      {/* <PrimaryButton label="Update" onPress={updateProfile} /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  containerView: {},
  imageBanner: {
    width: "100%",
    height: 250,
  },
  eventDetails: {
    padding: 10,
  },
  eventName: {
    fontWeight: "800",
    fontSize: 24,
  },
  icon: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: "#ff0000",
  },
  row: {
    marginVertical: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  details: {
    marginLeft: 10,
  },
  detailsHeading: {
    fontSize: 20,
    fontWeight: "500",
  },
  detailsInfo: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    color: "#747688",
  },
  aboutEvent: {
    marginVertical: 10,
    fontWeight: "500",
    fontSize: 18,
    lineHeight: 34,
  },
  mapButton: {
    marginLeft: 20,
  },
  shareView: {
    position: "absolute",
    right: 20,
    top: 20,
    borderRadius: 30,
    padding: 5,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  buttonView: {
    alignItems: "center",
    margin: 30,
  },
  primaryButton: {
    width: "50%",
  },
  gradientButton: {
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    color: "#ffffff",
  },
  secondaryButton: {
    alignItems: "center",
  },
});
