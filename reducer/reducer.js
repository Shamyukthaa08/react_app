export const initialState = {
  userType: "",
  user: {},
  city: "Chennai",
  phoneNumber: "",
  isLoggedIn: false,
};

export const reducer = (state, action) => {
  switch (action.type) {
    case "PhoneNumber":
      return {
        ...state,
        phoneNumber: action.payload,
      };
    case "City":
      return {
        ...state,
        city: action.payload,
      };
    case "UserLogin":
      return {
        ...state,
        user: action.payload,
        userType: "User",
        isLoggedIn: true,
      };
    case "AdminLogin":
      return {
        ...state,
        user: action.payload,
        userType: "Admin",
        isLoggedIn: true,
      };
    case "Logout":
      return {
        ...state,
        user: {},
        userType: "",
        phoneNumber: "",
        isLoggedIn: false,
      };
  }
  return state;
};
