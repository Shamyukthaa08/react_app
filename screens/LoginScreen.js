import { useState, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Button,
  Image,
  TextInput,
} from "react-native";
import PhoneInput from "react-native-phone-number-input";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import Toast from "react-native-root-toast";

import PrimaryButton from "../components/PrimaryButton";
import { firebaseConfig } from "../config/firebaseConfig";

// Firebase references
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

if (!app?.options) {
  throw new Error("Invalid Firebase config.");
}

export default function LoginScreen({ navigation }) {
  const [rawPhoneNumber, setRawPhoneNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const phoneInput = useRef(null);
  const [errorMessage, setErrorMessage] = useState();
  const [message, showMessage] = useState();
  const recaptchaVerifier = useRef(null);
  const firebaseConfig = app ? app.options : undefined;
  const attemptInvisibleVerification = true;
  const [verificationId, setVerificationId] = useState();
  const [verificationCode, setVerificationCode] = useState();

  const skipLogin = () => {
    navigation.popToTop();
  };

  const login = async () => {
    const isValidPhone = phoneInput.current?.isValidNumber(rawPhoneNumber);
    if (!isValidPhone) {
      setErrorMessage("Please enter valid Phone Number");
    } else {
      try {
        console.log("init phone auth", auth);
        const phoneProvider = new PhoneAuthProvider(auth);
        console.log("b4 verifyPhoneNumber");
        const verificationId = await phoneProvider.verifyPhoneNumber(
          phoneNumber,
          recaptchaVerifier.current
        );
        console.log("after verifyPhoneNumber");
        setVerificationId(verificationId);
        Toast.show("Verification code has been sent to your phone.", {
          duration: Toast.durations.SHORT,
        });
      } catch (err) {
        console.log("error", err);
        Toast.show(`Error: ${err.message}`, {
          duration: Toast.durations.SHORT,
        });
      }
    }
  };

  const confirmVerificationCode = async () => {
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      await signInWithCredential(auth, credential);
      Toast.show("Phone authentication successful 👍", {
        duration: Toast.durations.SHORT,
        backgroundColor: "#009B77",
      });
      const user = auth.currentUser;
      console.log("user after login", user);
      setTimeout(function () {
        navigation.navigate("Home");
      }, 1000);
    } catch (err) {
      Toast.show(`Error: ${err.message}`, {
        duration: Toast.durations.SHORT,
        backgroundColor: "#ff0000",
      });
    }
  };

  console.log("LoginScreen render");
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerView}
        keyboardShouldPersistTaps={true}
      >
        <View style={styles.imageView}>
          <Image source={require("../assets/logo.png")} />
        </View>
        <View style={styles.loginDetails}>
          {!verificationId && (
            <>
              <Text style={styles.label}>Phone Number:</Text>
              <PhoneInput
                ref={phoneInput}
                defaultValue={phoneNumber}
                defaultCode="IN"
                layout="first"
                onChangeText={(text) => {
                  setErrorMessage(undefined);
                  setRawPhoneNumber(text);
                }}
                onChangeFormattedText={(text) => {
                  setPhoneNumber(text);
                }}
                withDarkTheme
                withShadow
                autoFocus
                containerStyle={styles.phoneInput}
              />
            </>
          )}
          {verificationId && (
            <>
              <Text style={{ marginTop: 20 }}>Enter Verification code</Text>
              <TextInput
                style={{ marginVertical: 10, fontSize: 17 }}
                editable={!!verificationId}
                placeholder="123456"
                onChangeText={setVerificationCode}
              />
            </>
          )}
          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        </View>
        <PrimaryButton
          label="Continue"
          onPress={verificationId ? confirmVerificationCode : login}
        />
        <Button title="Skip & Continue as Guest" onPress={skipLogin} />
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={firebaseConfig}
          //attemptInvisibleVerification={attemptInvisibleVerification}
        />
        {/* {attemptInvisibleVerification && <FirebaseRecaptchaBanner />} */}
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
  imageView: {
    alignItems: "center",
    marginVertical: 20,
  },
  loginDetails: {
    padding: 10,
    marginBottom: 20,
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
  secondaryButton: {
    alignItems: "flex-start",
  },
  errorText: {
    fontSize: 12,
    color: "red",
    marginTop: 20,
    textAlign: "center",
  },
  phoneInput: {
    width: "100%",
  },
});
