import { useContext } from "react";
import {
  Button,
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  Share,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import openMap from "react-native-open-maps";
import { format } from "date-fns";
import axios from "axios";

import PrimaryButton from "../components/PrimaryButton";
import { UserContext } from "../context/UserContext";

import {
  SERVER_API_URL,
  API_URL_EVENT,
  API_URL_APPROVE,
} from "../config/config";

import DateIcon from "../assets/images/date.svg";
import LocationIcon from "../assets/images/location.svg";
import ShareIcon from "../assets/images/share.svg";

export default function DetailsScreen({ navigation, route }) {
  const {
    id,
    image,
    title,
    beginDate,
    closeDate,
    startTime,
    endTime,
    locality,
    landmark,
    category,
    latitude,
    longitude,
    description,
    userId,
    approved,
  } = route.params;

  const { state, dispatch } = useContext(UserContext);

  const shareEventDetails = () => {
    Share.share({
      title,
      message: `Checkout the event ${title.toUpperCase()} @ ${landmark}, ${locality} on GetOut App! 
      \nDate: ${format(new Date(beginDate), "dd-MMM-yyyy")} ${(beginDate !== closeDate) ? 'To ' + format(new Date(closeDate), "dd-MMM-yyyy") : '' } at ${format(
        new Date(startTime),
        "hh:mm aa"
      )} - ${format(
        new Date(endTime),
        "hh:mm aa"
      )}`,
      //url: 'https://getoutapp.com',
    });
  };

  const editEvent = async () => {
    console.log("editEvent");
    navigation.navigate("AddEvent", {
      title: "Edit Event",
      mode: "edit",
      event: { ...route.params },
    });
  };

  const approveEvent = async () => {
    console.log("approveEvent");
    const endPoint = `${SERVER_API_URL}${API_URL_EVENT}${API_URL_APPROVE}/${id}`;
    const payload = {};
    console.log("endpoint", endPoint);
    try {
      const { data } = await axios.post(endPoint, payload);
      console.log("data", data);
      navigation.navigate("ReviewEvents");
    } catch (error) {
      console.log("error", error);
    }
  };

  const deleteEvent = async () => {
    console.log("deleteEvent");
    const endPoint = `${SERVER_API_URL}${API_URL_EVENT}/${id}`;
    console.log("endpoint", endPoint);
    try {
      const { data } = await axios.delete(endPoint);
      console.log("data", data);
      navigation.navigate("ReviewEvents");
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.containerView}>
        <ImageBackground
          source={
            image ? { uri: image } : require("../assets/images/concert1.png")
          }
          resizeMode="stretch"
          style={styles.imageBanner}
        >
          <View style={styles.shareView}>
            <TouchableOpacity onPress={() => shareEventDetails()}>
              <ShareIcon style={styles.shareIcon} width={30} height={30} />
            </TouchableOpacity>
          </View>
        </ImageBackground>
        <View style={styles.eventDetails}>
          <Text style={styles.eventName}>{title}</Text>
          <View style={styles.row}>
            <DateIcon />
            <View style={styles.details}>
              <Text style={styles.detailsHeading}>
                {format(new Date(beginDate), "dd-MMM-yyyy")}
                {beginDate !== closeDate && (
                  <Text>
                    {" To "}
                    {format(new Date(closeDate), "dd-MMM-yyyy")}
                  </Text>
                )}
              </Text>
              <Text style={styles.detailsInfo}>
                {format(new Date(startTime), "hh:mm aa")} -{" "}
                {format(new Date(endTime), "hh:mm aa")}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <LocationIcon />
            <View style={styles.details}>
              <Text style={styles.detailsHeading}>{locality}</Text>
              <Text style={styles.detailsInfo}>{landmark}</Text>
            </View>
            {/* <View style={styles.mapButton}>
              <Button
                title="Map"
                onPress={() =>
                  openMap({
                    provider: "google",
                    latitude: latitude,
                    longitude: longitude,
                  })
                }
              />
            </View> */}
          </View>
          {category && (
            <>
              <Text style={styles.aboutEvent}>Category</Text>
              <Text>{category}</Text>
            </>
          )}
          {description && (
            <>
              <Text style={styles.aboutEvent}>About Event</Text>
              <Text>{description}</Text>
            </>
          )}
        </View>
        <View style={styles.buttonView}>
          {state.userType === "Admin" && !approved && (
            <Button title="Approve" onPress={approveEvent} />
          )}
          {(state.userType === "Admin" ||
            (state.user?.uid === userId && !approved)) && (
            <Button title="Delete" onPress={deleteEvent} />
          )}
        </View>
      </ScrollView>
      {(state.userType === "Admin" || state.user?.uid === userId) && (
        <PrimaryButton label="Edit" onPress={editEvent} />
      )}
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
    marginVertical: 10,
    flexDirection: "row",
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
});
