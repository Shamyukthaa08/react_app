import { useState, useContext, useEffect } from "react";
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
import {
  addDays,
  nextSaturday,
  nextSunday,
  isSaturday,
  isSunday,
  format,
  compareAsc,
  previousMonday,
  endOfMonth,
  startOfMonth,
} from "date-fns";

import { UserContext } from "../context/UserContext";
import { isDateBetween, isWeekBetween, isMonthBetween } from "../utils/utils";

import { SERVER_API_URL, API_URL_EVENT } from "../config/config";

export default function SearchScreen({ navigation, route }) {
  const { state, dispatch } = useContext(UserContext);

  const [isLoading, setIsLoading] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    filterEventsByFilter(route.params);
  }, [route.params]);

  const filterEventsByFilter = async (params) => {
    const { category, timeName } = params;
    console.log("getEvents category", category, "timeName", timeName);
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
          compareAsc(today, new Date(event.closeDate)) <= 0 &&
          event.city === state.city &&
          event.approved
        ) {
          if (category === event.category) {
            console.log("matching category");
            eventList.push(event);
          } else if (
            timeName === "Today" &&
            isDateBetween(
              today,
              new Date(event.beginDate),
              new Date(event.closeDate)
            )
          ) {
            console.log("matching today");
            eventList.push(event);
          } else if (
            timeName === "Tomorrow" &&
            // isSameDay(addDays(today, 1), new Date(event.beginDate))
            isDateBetween(
              addDays(today, 1),
              new Date(event.beginDate),
              new Date(event.closeDate)
            )
          ) {
            console.log("matching tomorrow");
            eventList.push(event);
          } else if (timeName === "This Weekend") {
            if (
              isSaturday(today) &&
              (isDateBetween(
                today,
                new Date(event.beginDate),
                new Date(event.closeDate)
              ) ||
                isDateBetween(
                  addDays(today, 1),
                  new Date(event.beginDate),
                  new Date(event.closeDate)
                )) //Saturday
            ) {
              console.log("matching this weekend - sat & sun");
              eventList.push(event);
            } else if (
              isSunday(today) &&
              isDateBetween(
                today,
                new Date(event.beginDate),
                new Date(event.closeDate)
              ) //Sunday
            ) {
              console.log("matching this weekend - sun");
              eventList.push(event);
            } else if (
              !isSaturday(today) &&
              !isSunday(today) &&
              (isDateBetween(
                nextSaturday(today),
                new Date(event.beginDate),
                new Date(event.closeDate)
              ) ||
                isDateBetween(
                  nextSunday(today),
                  new Date(event.beginDate),
                  new Date(event.closeDate)
                )) //Weekday
            ) {
              console.log("matching this weekend");
              eventList.push(event);
            }
          } else if (timeName === "Next Weekend") {
            const nextWeekToday = addDays(today, 7);
            if (
              isSaturday(nextWeekToday) &&
              (isDateBetween(
                nextWeekToday,
                new Date(event.beginDate),
                new Date(event.closeDate)
              ) ||
                isDateBetween(
                  addDays(nextWeekToday, 1),
                  new Date(event.beginDate),
                  new Date(event.closeDate)
                )) //Saturday
            ) {
              console.log("matching next weekend - sat & sun");
              eventList.push(event);
            } else if (
              isSunday(nextWeekToday) &&
              isDateBetween(
                nextWeekToday,
                new Date(event.beginDate),
                new Date(event.closeDate)
              )
              //Sunday
            ) {
              console.log("matching next weekend - sun");
              eventList.push(event);
            } else if (
              !isSaturday(nextWeekToday) &&
              !isSunday(nextWeekToday) &&
              (isDateBetween(
                nextSaturday(nextWeekToday),
                new Date(event.beginDate),
                new Date(event.closeDate)
              ) ||
                isDateBetween(
                  nextSunday(nextWeekToday),
                  new Date(event.beginDate),
                  new Date(event.closeDate)
                ))
              //Weekday
            ) {
              console.log("matching next weekend");
              eventList.push(event);
            }
          } else if (timeName === "This Week") {
            if (
              isWeekBetween(
                today,
                new Date(event.beginDate),
                new Date(event.closeDate)
              )
            ) {
              console.log("matching this week");
              eventList.push(event);
            }
          } else if (timeName === "Next Week") {
            if (
              isDateBetween(
                previousMonday(addDays(today, 7)),
                new Date(event.beginDate),
                new Date(event.closeDate)
              ) ||
              isDateBetween(
                nextSunday(addDays(today, 7)),
                new Date(event.beginDate),
                new Date(event.closeDate)
              )
            ) {
              console.log("matching next week");
              eventList.push(event);
            }
          } else if (timeName === "This Month") {
            console.log('this month event?', event)
            if (
              isDateBetween(
                new Date(event.beginDate),
                startOfMonth(today),
                endOfMonth(today),
              ) ||
              isDateBetween(
                new Date(event.closeDate),
                startOfMonth(today),
                endOfMonth(today),
              )
            ) {
              console.log("matching this month");
              eventList.push(event);
            }
          } else if (timeName === "Next Month") {
            if (
              isDateBetween(
                startOfMonth(addDays(today, 30)),
                new Date(event.beginDate),
                new Date(event.closeDate)
              ) ||
              isDateBetween(
                endOfMonth(addDays(today, 30)),
                new Date(event.beginDate),
                new Date(event.closeDate)
              )
            ) {
              console.log("matching next month");
              eventList.push(event);
            }
          } else if (timeName === "All Upcoming") {
            console.log("matching else");
            eventList.push(event);
          }
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
          <Text style={styles.empty}>No Events Scheduled</Text>
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
                  resizeMode="stretch"
                  style={styles.imageBanner}
                />
                <View style={styles.eventDetails}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <Text style={styles.eventDate}>
                    {format(new Date(event.beginDate), "dd-MMM-yyyy")} To{" "}
                    {format(new Date(event.closeDate), "dd-MMM-yyyy")}
                  </Text>
                  <Text style={styles.eventDate}>
                    {format(new Date(event.startTime), "hh:mm aa")} -{" "}
                    {format(new Date(event.endTime), "hh:mm aa")}
                  </Text>
                  <Text style={styles.eventDate}>
                    {event.locality} {event.landmark}
                  </Text>
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
    height: 110,
  },
  eventRow: {
    padding: 10,
    flexDirection: "row",
    alignContent: "flex-start",
  },
  eventDetails: {
    width: "65%",
    marginHorizontal: 10,
  },
  eventName: {
    fontWeight: "600",
    fontSize: 22,
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
