import { View, Text, StyleSheet, FlatList } from "react-native";

import { Place } from "./Home";
import PlacePreview from "./PlacePreview";
import colors from "./colors";

export default function PlaceResultPage({searchKeyword, searchedPlaces}: {searchKeyword: string, searchedPlaces: Place[]}) {
  // Handle too long searchKeyword with ...
  const truncatedSearchKeyword = searchKeyword.length > 10 ? searchKeyword.slice(0, 10) + "..." : searchKeyword;

  return (
    <View style={styles.container}>
      <View style={styles.searchKeywordContainer}>
        <Text style={styles.searchKeywordText}>{truncatedSearchKeyword} Recommendations</Text>
      </View>
      <View style={styles.placeListContainer}>
        <FlatList
          data={searchedPlaces}
          renderItem={({item}) => <PlacePreview place={item} />}
          style={styles.flatList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  searchKeywordContainer: {
    paddingLeft: 16,
    width: "100%",
  },
  searchKeywordText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.brightBorder,
  },
  placeListContainer: {
    flex: 1,
    width: "100%",
  },
  flatList: {
    width: "100%",
  },
  separator: {
    height: 1,
    backgroundColor: colors.brightBorder,
    marginHorizontal: 16,
  }
});