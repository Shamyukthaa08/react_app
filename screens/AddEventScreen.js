import { useEffect, useState, useContext } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Button,
  TextInput,
  Image,
  Platform,
  Pressable,
} from "react-native";
import openMap from "react-native-open-maps";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import Toast from "react-native-root-toast";
import Spinner from "react-native-loading-spinner-overlay";
import { format } from "date-fns";

import PrimaryButton from "../components/PrimaryButton";
import { UserContext } from "../context/UserContext";

import { SERVER_API_URL, API_URL_EVENT } from "../config/config";

export default function AddEventScreen({ navigation, route }) {
  const { state } = useContext(UserContext);

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [landmark, setLandmark] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState(state.city);
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const [beginDate, setBeginDate] = useState(currentDate);
  const [closeDate, setCloseDate] = useState(currentDate);
  const startDate = new Date();
  const endDate = new Date();
  startDate.setHours(9, 0, 0, 0);
  endDate.setHours(17, 0, 0, 0);
  const [startTime, setStartTime] = useState(startDate);
  const [endTime, setEndTime] = useState(endDate);
  const [approved, setApproved] = useState(
    state?.userType === "Admin" ? true : false
  );
  const [userId, setUserId] = useState(state?.user?.uid);
  const [loading, setLoading] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);

  useEffect(() => {
    const mode = route.params?.mode;
    console.log("user", state?.user?.uid);
    if (mode === "edit") {
      console.log("edit mode");
      const {
        id,
        image,
        title,
        city,
        category,
        beginDate,
        closeDate,
        startTime,
        endTime,
        locality,
        landmark,
        latitude,
        longitude,
        description,
      } = route.params.event;
      setId(id);
      setImage(image);
      setName(title);
      setDescription(description);
      setLandmark(landmark);
      setLocality(locality);
      setCity(city);
      setCategory(category);
      setBeginDate(new Date(beginDate));
      setCloseDate(new Date(closeDate));
      setStartTime(new Date(startTime));
      setEndTime(new Date(endTime));
    }
    setApproved(state?.userType === "Admin" ? true : false);
  }, [route.params]);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
    });

    console.log(result);

    if (!result.cancelled) {
      const manipResult = await manipulateAsync(
        result.uri,
        [{ resize: { height: 400, width: 400 } }],
        { compress: 0.5, format: SaveFormat.PNG }
      );
      handleImagePicked(manipResult);
    }
  };

  const onStartDateChange = (event, selectedDate) => {
    console.log("onStartDateChange", selectedDate);
    selectedDate.setHours(0, 0, 0, 0);
    setBeginDate(selectedDate);
    const newStartTime = startTime;
    newStartTime.setDate(selectedDate.getDate());
    newStartTime.setMonth(selectedDate.getMonth());
    newStartTime.setFullYear(selectedDate.getFullYear());
    const newEndTime = endTime;
    newEndTime.setDate(selectedDate.getDate());
    newEndTime.setMonth(selectedDate.getMonth());
    newEndTime.setFullYear(selectedDate.getFullYear());
    setStartTime(newStartTime);
    setEndTime(newEndTime);
    setShowStartDate(false);
  };

  const onEndDateChange = (event, selectedDate) => {
    console.log("onEndDateChange", selectedDate);
    selectedDate.setHours(0, 0, 0, 0);
    setCloseDate(selectedDate);
    setShowEndDate(false);
  };

  const onStartTimeChange = (event, selectedTime) => {
    setStartTime(selectedTime);
    setShowStartTime(false);
  };

  const onEndTimeChange = (event, selectedTime) => {
    setEndTime(selectedTime);
    setShowEndTime(false);
  };

  const saveEvent = async () => {
    console.log("saveEvent");
    const mode = route.params?.mode;
    const endPoint =
      mode === "edit"
        ? `${SERVER_API_URL}${API_URL_EVENT}/${id}`
        : `${SERVER_API_URL}${API_URL_EVENT}`;
    const payload = {
      name,
      beginDate,
      closeDate,
      startTime,
      endTime,
      landmark,
      locality,
      city,
      category,
      latitude: 12.76,
      longitude: 80.12,
      description,
      approved,
      image: image ? image : "",
    };
    if (mode !== "edit") {
      payload.userId = userId;
    }
    console.log("endpoint", endPoint);
    console.log("payload", payload);
    try {
      const { data } =
        route.params?.mode === "edit"
          ? await axios.patch(endPoint, payload)
          : await axios.post(endPoint, payload);
      console.log("data", data);
      if (!approved) {
        Toast.show(
          "Event is submitted for Moderator approval. Event will appear once it is approved",
          {
            duration: Toast.durations.SHORT,
          }
        );
      } else {
        Toast.show("Event is saved.", {
          duration: Toast.durations.SHORT,
        });
      }
      navigation.navigate("Home");
    } catch (error) {
      Toast.show(`Error: ${error.message}`, {
        duration: Toast.durations.SHORT,
      });
      console.log("error", error);
    }
  };

  const handleImagePicked = async (pickerResult) => {
    try {
      setLoading(true);

      if (!pickerResult.cancelled) {
        const uploadUrl = await uploadImageAsync(pickerResult.uri);
        console.log("uploadUrl", uploadUrl);
        setImage(uploadUrl);
      }
    } catch (e) {
      console.log(e);
      alert("Upload failed, please try again!");
    } finally {
      setLoading(false);
    }
  };

  const uploadImageAsync = async (uri) => {
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log("xhr error", e);
        reject(new TypeError("Network request failed"));
      };
      console.log("calling blob");
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    console.log("calling getStorage");
    const fileRef = ref(getStorage(), uuidv4());
    console.log("fileRef");
    const result = await uploadBytes(fileRef, blob);

    // We're done with the blob, close and release it
    blob.close();

    return await getDownloadURL(fileRef);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerView}
      >
        <View style={styles.eventDetails}>
          <Text style={styles.label}>Event Name:</Text>
          <TextInput
            style={styles.input}
            onChangeText={setName}
            value={name}
            placeholder="Event Name"
            maxLength={40}
          />
          <View style={styles.row}>
            <Text style={styles.label}>
              Start Date:{" "}
              {Platform.OS === "android"
                ? format(new Date(beginDate), "dd-MMM-yyyy")
                : ""}
            </Text>
            {Platform.OS === "android" && (
              <Pressable
                onPress={() => setShowStartDate(true)}
                style={styles.changeButton}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </Pressable>
            )}
          </View>
          {(showStartDate || Platform.OS === "ios") && (
            <DateTimePicker
              testID="datePicker"
              value={beginDate}
              mode="date"
              is24Hour={true}
              onChange={onStartDateChange}
            />
          )}
          <View style={styles.row}>
            <Text style={styles.label}>
              End Date:{" "}
              {Platform.OS === "android"
                ? format(new Date(closeDate), "dd-MMM-yyyy")
                : ""}
            </Text>
            {Platform.OS === "android" && (
              <Pressable
                onPress={() => setShowEndDate(true)}
                style={styles.changeButton}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </Pressable>
            )}
          </View>
          {(showEndDate || Platform.OS === "ios") && (
            <DateTimePicker
              testID="datePicker"
              value={closeDate}
              mode="date"
              is24Hour={true}
              onChange={onEndDateChange}
            />
          )}
          <View style={styles.row}>
            <Text style={styles.label}>
              Start Time:{" "}
              {Platform.OS === "android"
                ? format(new Date(startTime), "hh:mm aa")
                : ""}
            </Text>
            {Platform.OS === "android" && (
              <Pressable
                onPress={() => setShowStartTime(true)}
                style={styles.changeButton}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </Pressable>
            )}
          </View>
          {(showStartTime || Platform.OS === "ios") && (
            <DateTimePicker
              testID="startTimePicker"
              value={startTime}
              mode="time"
              is24Hour={true}
              onChange={onStartTimeChange}
            />
          )}
          <View style={styles.row}>
            <Text style={styles.label}>
              End Time:{" "}
              {Platform.OS === "android"
                ? format(new Date(endTime), "hh:mm aa")
                : ""}
            </Text>
            {Platform.OS === "android" && (
              <Pressable
                onPress={() => setShowEndTime(true)}
                style={styles.changeButton}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </Pressable>
            )}
          </View>
          {(showEndTime || Platform.OS === "ios") && (
            <DateTimePicker
              testID="endTimePicker"
              value={endTime}
              mode="time"
              is24Hour={true}
              onChange={onEndTimeChange}
            />
          )}
          <Text style={styles.label}>Landmark :</Text>
          <TextInput
            style={styles.input}
            onChangeText={setLandmark}
            value={landmark}
            placeholder="Landmark"
            maxLength={30}
          />
          <Text style={styles.label}>Locality :</Text>
          <TextInput
            style={styles.input}
            onChangeText={setLocality}
            value={locality}
            placeholder="Locality"
            maxLength={20}
          />
          <Text style={styles.label}>City :</Text>
          <RNPickerSelect
            fixAndroidTouchableBug={true}
            style={{
              ...pickerSelectStyles,
              iconContainer: {
                top: 15,
                right: 12,
              },
            }}
            useNativeAndroidPickerStyle={false}
            onValueChange={(value) => setCity(value)}
            items={[
              { label: "Chennai", value: "Chennai" },
              { label: "Bangalore", value: "Bangalore" },
            ]}
            value={city}
            Icon={() => {
              return <Ionicons name="chevron-down" size={24} color="gray" />;
            }}
          />
          {/* <View style={styles.secondaryButton}>
            <Button
              title="Select Location From Map"
              onPress={() =>
                openMap({
                  provider: "google",
                })
              }
            />
          </View> */}
          <Text style={styles.label}>Category :</Text>
          <RNPickerSelect
            fixAndroidTouchableBug={true}
            style={{
              ...pickerSelectStyles,
              iconContainer: {
                top: 15,
                right: 12,
              },
            }}
            useNativeAndroidPickerStyle={false}
            onValueChange={(value) => setCategory(value)}
            items={[
              { label: "Fair", value: "Fair" },
              { label: "Festival", value: "Festival" },
              { label: "Music Concert", value: "Music Concert" },
              { label: "Dance", value: "Dance" },
              { label: "Kids", value: "Kids" },
              { label: "Night Life", value: "Night Life" },
              { label: "Sports", value: "Sports" },
              { label: "Family", value: "Family" },
              { label: "Outdoor", value: "Outdoor" },
              { label: "Meetup", value: "Meetup" },
            ]}
            value={category}
            Icon={() => {
              return <Ionicons name="chevron-down" size={24} color="gray" />;
            }}
          />
          <View style={styles.secondaryButton}>
            <Button title="Select Event Image" onPress={pickImage} />
          </View>
          <Spinner
            visible={loading}
            textContent={"Uploading Image..."}
            textStyle={styles.spinnerTextStyle}
          />
          {image && <Image source={{ uri: image }} style={styles.image} />}
          <Text style={styles.label}>Description :</Text>
          <TextInput
            style={styles.inputTextArea}
            onChangeText={setDescription}
            value={description}
            placeholder="Description"
            multiline
            maxLength={150}
          />
        </View>
      </ScrollView>
      <PrimaryButton label="Save" onPress={saveEvent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  containerView: {},
  eventDetails: {
    padding: 10,
  },
  row: {
    flexDirection: "row",
    marginVertical: 10,
  },
  label: {
    fontSize: 20,
    fontWeight: "500",
  },
  input: {
    height: 40,
    marginVertical: 12,
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    borderColor: "lightgrey",
  },
  inputTextArea: {
    height: 100,
    marginVertical: 12,
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    borderColor: "lightgrey",
  },
  secondaryButton: {
    alignItems: "flex-start",
  },
  buttonView: {
    alignItems: "center",
    marginBottom: 20,
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
  spinnerTextStyle: {
    color: "#FFF",
    backgroundColor: "#000",
  },
  changeButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "#1b9ae3",
    width: "30%",
    marginHorizontal: 10,
  },
  changeButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "bold",
    color: "white",
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 10,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 4,
    paddingRight: 30, // to ensure the text is never behind the icon
    padding: 10,
  },
  inputAndroid: {
    fontSize: 12,
    marginVertical: 10,
    borderWidth: 0.5,
    borderColor: "lightgrey",
    borderRadius: 8,
    paddingRight: 30, // to ensure the text is never behind the icon
    padding: 10, // to ensure the text is never behind the icon
  },
});
