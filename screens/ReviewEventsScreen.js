import { useState, useContext, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import { format, compareAsc } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";

import { UserContext } from "../context/UserContext";

import { SERVER_API_URL, API_URL_EVENT } from "../config/config";

export default function ReviewEventsScreen({ navigation }) {
  const { state } = useContext(UserContext);

  const [isLoading, setIsLoading] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState([]);

  useFocusEffect(
    useCallback(() => {
      filterEventsByFilter();
    }, [])
  );

  const filterEventsByFilter = async () => {
    setIsLoading(true);

    const endPoint = `${SERVER_API_URL}${API_URL_EVENT}`;
    try {
      const { data } = await axios.get(endPoint);
      console.log("data", data);
      const eventList = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      data.map((event) => {
        if (
          //compareAsc(new Date(event.beginDate), today) >= 0 &&
          event.city === state.city &&
          !event.approved
        ) {
          eventList.push(event);
        }
      });
      const sortedEventList = eventList.sort((a, b) =>
        compareAsc(new Date(a.beginDate), new Date(b.beginDate))
      );
      setFilteredEvents(sortedEventList);
      setIsLoading(false);
    } catch (error) {
      console.log("error", error);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerView}
      >
        {isLoading && <Text style={styles.loading}>Loading ...</Text>}
        {!isLoading && filteredEvents.length === 0 && (
          <Text style={styles.empty}>No Events for Review</Text>
        )}
        {!isLoading &&
          filteredEvents.map((event, index) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Details", {
                  title: event.name,
                  ...event,
                })
              }
              key={index}
            >
              <View style={styles.eventRow}>
                <Image
                  source={
                    event.image
                      ? { uri: event.image }
                      : require("../assets/images/concert1.png")
                  }
                  resizeMode="cover"
                  style={styles.imageBanner}
                />
                <View style={styles.eventDetails}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <Text style={styles.eventDate}>
                    {format(new Date(event.beginDate), "dd-MMM-yyyy")} To{" "}
                    {format(new Date(event.closeDate), "dd-MMM-yyyy")}
                  </Text>
                  <Text style={styles.eventDate}>{event.locality}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>
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
    width: "30%",
    height: 100,
  },
  eventRow: {
    padding: 10,
    flexDirection: "row",
  },
  eventDetails: {
    width: "65%",
    margin: 10,
  },
  eventName: {
    fontWeight: "800",
    fontSize: 24,
  },
  eventDate: {
    marginTop: 5,
  },
  loading: {
    marginTop: 40,
    fontSize: 20,
    textAlign: "center",
  },
  empty: {
    marginTop: 40,
    fontSize: 20,
    textAlign: "center",
  },
});
