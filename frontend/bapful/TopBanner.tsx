import {View, Text, StyleSheet, Image, Dimensions, TouchableOpacity} from "react-native";

import colors from "./colors";

export default function TopBanner({toggleUserProfile, backToHome}: {toggleUserProfile: () => void, backToHome: () => void}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => backToHome()}>
        <View style={styles.bapfulLogoContainer}>
          <Image source={require("./assets/bapful_logo.png")} style={styles.bapfulLogo} />
        </View>
      </TouchableOpacity>
      <Image source={require("./assets/chopstick_menu.png")} style={styles.chopstickMenu} />
      <View style={styles.userProfileContainer}>
        <TouchableOpacity onPress={() => toggleUserProfile()}>
          <Image source={require("./assets/user.png")} style={styles.userProfile} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryColor,
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.brightBorder,
    // flex: 1,
  },
  bapfulLogoContainer: {
    paddingLeft: 10,
  },
  bapfulLogo: {
    width: Dimensions.get("window").width / 3,
    height: 100,
    // height: Dimensions.get("window").width / 3,
  },
  chopstickMenu: {
    width: Dimensions.get("window").width / 8,
    height: Dimensions.get("window").width / 8,
    position: "absolute",
    right: 20,
  },
  userProfileContainer: {
    position: "absolute",
    right: 30 + Dimensions.get("window").width / 8,
    borderWidth: 1,
    borderColor: colors.brightBorder,
    borderRadius: 10,
    backgroundColor: colors.tertiaryColor,
  },
  userProfile: {
    width: Dimensions.get("window").width / 10,
    height: Dimensions.get("window").width / 10,
  },
});