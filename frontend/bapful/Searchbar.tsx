import {View, Text, StyleSheet, Image, TouchableOpacity, TextInput} from "react-native";
import { useState } from "react";

import colors from "./colors";
import { Place } from "./Home";

export default function Searchbar({setSearchedPlaces, setSearchKeyword}: {setSearchedPlaces: (places: Place[]) => void, setSearchKeyword: (keyword: string) => void}) {
  const [searchText, setSearchText] = useState<string>("");

  const handleSearch = () => {
    // Query nearby location with searchText
    const dummy = [
    {
      latitude: 37.5665,
      longitude: 126.9780,
      name: "Korean BBQ",
      address: "Seoul, South Korea",
      image: "https://picsum.photos/200/300?random=1",
      description: "Charcoal BBQ with a side of kimchi and rice",
      rating: 4.5,
      ratingCount: 100,
      reviews: [{
        user: "John Doe",
        comment: "This is a great place to eat!",
        rating: 5,
        date: "2025-01-01"
      }, {
        user: "Jane Doe",
        comment: "This is a great place to eat!",
        rating: 5,
        date: "2025-01-01"
      }],
      images: [
        "https://picsum.photos/200/300?random=1",
        "https://picsum.photos/200/300?random=2",
      ]
    },
    {
      latitude: 37.5665,
      longitude: 126.9780,
      name: "Korean BBQ",
      address: "Seoul, South Korea",
      image: "https://picsum.photos/200/300?random=1",
      description: "Charcoal BBQ with a side of kimchi and rice",
      rating: 4.5,
      ratingCount: 100,
      reviews: [{
        user: "John Doe",
        comment: "This is a great place to eat!",
        rating: 5,
        date: "2025-01-01"
      }, {
        user: "Jane Doe",
        comment: "This is a great place to eat!",
        rating: 5,
        date: "2025-01-01"
      }],
      images: [
        "https://picsum.photos/200/300?random=1",
        "https://picsum.photos/200/300?random=2",
      ]
    },
    {
      latitude: 37.5665,
      longitude: 126.9780,
      name: "Korean BBQ",
      address: "Seoul, South Korea",
      image: "https://picsum.photos/200/300?random=1",
      description: "Charcoal BBQ with a side of kimchi and rice",
      rating: 4.5,
      ratingCount: 100,
      reviews: [{
        user: "John Doe",
        comment: "This is a great place to eat!",
        rating: 5,
        date: "2025-01-01"
      }, {
        user: "Jane Doe",
        comment: "This is a great place to eat!",
        rating: 5,
        date: "2025-01-01"
      }],
      images: [
        "https://picsum.photos/200/300?random=1",
        "https://picsum.photos/200/300?random=2",
      ]
    },

    ]
    setSearchedPlaces(dummy);
    setSearchKeyword(searchText);
  }

  return (
    <View style={styles.Searchbar}>
      <TextInput style={styles.searchInput} value={searchText} onChangeText={setSearchText} placeholder="Find Your Perfect Korean Meal!" />
      <View style={styles.searchIconContainer}>
        <TouchableOpacity onPress={handleSearch}>
          <Image source={require("./assets/search_icon.png")} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  Searchbar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.brightBorder,
    backgroundColor: colors.secondaryColor,
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    width: "100%",
    left: 10
  },
  searchIconContainer: {
    right: 10,
    height: "100%",
    justifyContent: "center",
    paddingLeft: 10,
    paddingRight: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
});