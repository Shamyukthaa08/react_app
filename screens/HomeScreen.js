import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  useContext,
} from "react";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import {
  ScrollView,
  NativeViewGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Entypo } from "@expo/vector-icons";
import {
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import axios from "axios";
import { compareAsc, previousMonday, nextSunday } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

import PrimaryButton from "../components/PrimaryButton";
import { UserContext } from "../context/UserContext";
import { isWeekBetween } from "../utils/utils";

import { SERVER_API_URL, API_URL_EVENT } from "../config/config";

import Header from "../components/Header";

const { width } = Dimensions.get("window");

const eventCategories = [
  { name: "Fair" },
  { name: "Festival" },
  { name: "Music Concert" },
  { name: "Dance" },
  { name: "Kids" },
  { name: "Night Life" },
  { name: "Sports" },
  { name: "Family" },
  { name: "Outdoor" },
  { name: "Meetup" },
];

const timeFilters = [
  { name: "Today" },
  { name: "Tomorrow" },
  { name: "This Weekend" },
  { name: "Next Weekend" },
  { name: "This Week" },
  { name: "Next Week" },
  { name: "This Month" },
  { name: "Next Month" },
  { name: "All Upcoming" },
];

export default function HomeScreen({ navigation }) {
  const { state, dispatch } = useContext(UserContext);

  const [selectedCity, setSelectedCity] = useState(state.city);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const sheetRef = useRef(null);

  const cityData = useMemo(() => ["Chennai", "Bangalore"], []);
  const snapPoints = useMemo(() => ["50%"], []);

  useFocusEffect(
    useCallback(() => {
      console.log("useFocusEffect");
      const auth = getAuth();
      const user = auth.currentUser;
      console.log("useFocusEffect user", user);
      if (user) {
        console.log("updatePhoneNumber", user.phoneNumber);
        dispatch({ type: "PhoneNumber", payload: user.phoneNumber });
        if (
          user.phoneNumber === "+918754458445" ||
          user.phoneNumber === "+919884467525" ||
          user.phoneNumber === "+919999977777"
        ) {
          console.log("AdminLogin", user.phoneNumber);
          dispatch({ type: "AdminLogin", payload: user });
        } else {
          console.log("UserLogin", user.phoneNumber);
          dispatch({ type: "UserLogin", payload: user });
        }
      }
      filterEventsByCity(selectedCity);
    }, [selectedCity])
  );

  // callbacks
  const handleSheetChange = useCallback((index) => {
    console.log("handleSheetChange", index);
    // if (index === -1) {
    //   setShowModal(false);
    // }
  }, []);

  // render
  const renderCityItem = useCallback(
    ({ item }) => (
      <TouchableOpacity onPress={() => changeCity(item)}>
        <View style={styles.sheetItemContainer}>
          <Text style={styles.cityItemText}>{item}</Text>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  const changeCity = (city) => {
    dispatch({ type: "City", payload: city });
    setSelectedCity(city);
    setShowModal(false);
  };

  useEffect(() => {
    if (showModal) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [showModal]);

  useEffect(() => {
    console.log("useEffect selectedCity", selectedCity);
    filterEventsByCity(selectedCity);
  }, [selectedCity]);

  const filterEventsByCity = async (city) => {
    const eventList = [];
    const endPoint = `${SERVER_API_URL}${API_URL_EVENT}`;
    try {
      const { data } = await axios.get(endPoint);
      //console.log("data", data);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      data.map((event) => {
        console.log('checking event', event)
        if ((
          isWeekBetween(
            today,
            new Date(event.beginDate),
            new Date(event.closeDate)
          )) &&
          event.city === city &&
          event.approved
        ) {
          console.log('pushing event', event);
          eventList.push(event);
        }
      });
    } catch (error) {
      console.log("error", error);
    }
    console.log("eventList", eventList);
    const sortedEventList = eventList.sort((a, b) =>
      compareAsc(new Date(a.beginDate), new Date(b.beginDate))
    );
    setFilteredEvents(sortedEventList);
  };

  const filterEventsByCategory = (category) => {
    navigation.navigate("Search", { category });
  };

  const filterEventsByTime = (timeFilter) => {
    navigation.navigate("Search", {
      timeName: timeFilter.name,
    });
  };

  const LocationChooser = () => (
    <View>
      <View style={styles.currentLocationView}>
        <TouchableOpacity
          onPress={() => {
            setShowModal((m) => !m);
          }}
        >
          <View style={styles.currentLocationRow}>
            {selectedCity && (
              <Text numberOfLines={1} style={styles.locationText}>
                {selectedCity}
              </Text>
            )}
            {!selectedCity && (
              <Text numberOfLines={1} style={styles.locationText}>
                Select City
              </Text>
            )}
            <Entypo name="chevron-down" size={26} color="blue" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const addNewEvent = () => {
    console.log("Add Event", state.phoneNumber);
    if (state.phoneNumber) {
      console.log("navigate to AddEvent");
      navigation.navigate("AddEvent");
    } else {
      console.log("navigate to Login");
      navigation.navigate("Login");
    }
  };

  const getRandomItem = (items) => {
    return items[Math.floor(Math.random() * items.length)];
  };

  const getRandomNoRepeatsItem = (array) => {
    var copy = array.slice(0);
    return function () {
      if (copy.length < 1) {
        copy = array.slice(0);
      }
      var index = Math.floor(Math.random() * copy.length);
      var item = copy[index];
      copy.splice(index, 1);
      return item;
    };
  };
  const randomItemSelector = getRandomNoRepeatsItem(filteredEvents);

  const getFeaturedEvents = (events) => {
    return events.slice(0, 4);
  };

  const getTrendingEvents = (events) => {
    const eventList = [];
    //console.log("getTrendingEvents events.length", events.length);
    if (events.length > 0) {
      eventList.push(randomItemSelector());
    }
    if (events.length > 1) {
      eventList.push(randomItemSelector());
    }
    if (events.length > 2) {
      eventList.push(randomItemSelector());
    }
    return eventList;
  };

  const featuredEvents = getFeaturedEvents(filteredEvents);
  const trendingEvents = getTrendingEvents(filteredEvents);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <NativeViewGestureHandler disallowInterruption={true}>
      <SafeAreaView style={styles.container}>
          <BottomSheetModalProvider>
            <Header navigation={navigation} />
            <LocationChooser />
            <ScrollView
              scrollToOverflowEnabled={true}
              style={styles.scrollViewContainer}
            >
              {featuredEvents && featuredEvents.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.heading}>Featured</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.row}
                    scrollToOverflowEnabled={true}
                  >
                    {featuredEvents.map((event, index) => (
                      <View style={styles.featuredEvent} key={index}>
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("Details", {
                              title: event.name,
                              ...event,
                            })
                          }
                        >
                          <ImageBackground
                            source={
                              event.image
                                ? { uri: event.image }
                                : require("../assets/images/concert1.png")
                            }
                            resizeMode="stretch"
                            style={styles.featuredImage}
                            imageStyle={styles.imageBg}
                          >
                            <View style={styles.featuredEventView}>
                              <Text style={styles.name}>{event.name}</Text>
                            </View>
                          </ImageBackground>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
              {trendingEvents && trendingEvents.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.heading}>Trending</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.row}
                    scrollToOverflowEnabled={true}
                  >
                    {trendingEvents.map((event, index) => (
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("Details", {
                            title: event.name,
                            ...event,
                          })
                        }
                        key={`trending_${index}`}
                      >
                        <View
                          style={[
                            styles.event,
                            styles.center,
                            getRandomItem([
                              styles.cream,
                              styles.yellow,
                              styles.pink,
                            ]),
                          ]}
                        >
                          <Text style={styles.trendingName}>{event.name}</Text>
                          <Text style={styles.categoryName}>
                            {event.category}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              <View style={styles.section}>
                <Text style={styles.heading}>Event Categories</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryContainer}
                >
                  {eventCategories.map((category, index) => (
                    <TouchableOpacity
                      onPress={() => filterEventsByCategory(category.name)}
                      key={`category_${index}`}
                    >
                      <View style={[styles.category]} key={category.name}>
                        <Text style={styles.categoryText}>{category.name}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.section}>
                <Text style={styles.heading}>Events Timeline</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryContainer}
                >
                  {timeFilters.map((timeFilter, index) => (
                    <TouchableOpacity
                      onPress={() => filterEventsByTime(timeFilter)}
                      key={`time_${index}`}
                    >
                      <View style={[styles.time]} key={timeFilter.name}>
                        <Text style={styles.timeText}>{timeFilter.name}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <PrimaryButton label="Add New Event" onPress={addNewEvent} />
              <StatusBar style="auto" />
            </ScrollView>
            <BottomSheetModal
              ref={sheetRef}
              snapPoints={snapPoints}
              onChange={handleSheetChange}
              enablePanDownToClose={true}
              handleStyle={styles.bottomSheetHandle}
              enabledContentGestureInteraction={false}
              enabledContentTapInteraction={false}
            >
              <View>
                <Text style={styles.cityHeading}>Select your city</Text>
              </View>
              <BottomSheetFlatList
                data={cityData}
                keyExtractor={(i) => i}
                renderItem={renderCityItem}
                backdropComponent={BottomSheetBackdrop}
                contentContainerStyle={styles.sheetContentContainer}
              />
            </BottomSheetModal>
          </BottomSheetModalProvider>
      </SafeAreaView>
    </NativeViewGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 25,
  },
  scrollViewContainer: {},
  section: {
    alignItems: "flex-start",
    justifyContent: "center",
    marginVertical: 5,
    paddingLeft: 5,
  },
  heading: {
    fontWeight: "700",
    fontSize: 18,
    lineHeight: 34,
    paddingLeft: 10,
  },
  currentLocationView: {
    backgroundColor: "#ffffff",
    marginVertical: 1,
  },
  currentLocationRow: {
    flexDirection: "row",
    marginLeft: 20,
  },
  locationText: {
    fontSize: 18,
    fontWeight: "500",
    marginRight: 10,
  },
  row: {
    flexDirection: "row",
  },
  categoryContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  category: {
    boxShadow: "0px 8px 30px rgba(80, 85, 136, 0.06)",
    borderRadius: 18,
    borderColor: "#DADADA",
    borderWidth: 0.5,
    margin: 5,
    padding: 10,
    height: 100,
    width: (width - 44) / 3,
    backgroundColor: "#881952",
    justifyContent: "center",
  },
  categoryText: {
    fontWeight: "900",
    fontSize: 14,
    lineHeight: 23,
    color: "#ffffff",
    textAlign: "center",
  },
  time: {
    boxShadow: "0px 8px 30px rgba(80, 85, 136, 0.06)",
    borderRadius: 4,
    borderColor: "#DADADA",
    borderWidth: 0.5,
    margin: 5,
    padding: 5,
    height: 50,
    width: (width - 42) / 3,
    justifyContent: "center",
    alignItems: "center",
  },
  timeText: {
    fontWeight: "900",
    fontSize: 12,
    lineHeight: 23,
    color: "#881952",
    textAlign: "center",
  },
  event: {
    boxShadow: "0px 8px 30px rgba(80, 85, 136, 0.06)",
    borderRadius: 18,
    borderColor: "#DADADA",
    borderWidth: 0.5,
    margin: 5,
    padding: 5,
    height: 100,
    width: 240,
  },
  featuredEvent: {
    boxShadow: "0px 8px 30px rgba(80, 85, 136, 0.06)",
    borderRadius: 18,
    borderColor: "#DADADA",
    borderWidth: 0.5,
    margin: 5,
    height: 140,
    width: width - 80,
  },
  featuredEventView: {
    margin: 10,
    padding: 2,
    width: 150,
    borderRadius: 6,
    backgroundColor: "#ec1066",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  imageBg: {
    borderRadius: 18,
  },
  name: {
    fontWeight: "900",
    fontSize: 18,
    lineHeight: 23,
    color: "#ffffff",
    textAlign: "center",
  },
  trendingName: {
    fontWeight: "700",
    fontSize: 18,
    lineHeight: 23,
    textAlign: "center",
  },
  categoryName: {
    textAlign: "center",
  },
  center: {
    justifyContent: "center",
  },
  yellow: {
    backgroundColor: "#f0dcff",
  },
  pink: {
    backgroundColor: "#d26374",
  },
  cream: {
    backgroundColor: "#ffd7e5",
  },
  sheetContentContainer: {
    backgroundColor: "#ffffff",
    paddingBottom: 50,
  },
  sheetItemContainer: {
    padding: 12,
    margin: 6,
    alignItems: "center",
  },
  bottomSheetHandle: {
    backgroundColor: "#ebe6e6",
  },
  cityItemText: {
    fontSize: 20,
  },
  cityHeading: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 24,
    paddingVertical: 20,
  },
  buttonView: {
    alignItems: "center",
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
