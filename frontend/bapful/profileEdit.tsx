import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions, Image } from "react-native";
import { useState } from "react";

import colors from "./colors";

type ProfileEditProps = {
    toggleProfileEdit: () => void;
    profileMessage: string;
    setProfileMessage: (message: string) => void;
    selectedFoodImages: any[];
    foodImages: any[];
    setSelectedFoodImages: (images: any[]) => void;
};

export default function ProfileEdit({ 
    toggleProfileEdit, 
    profileMessage, 
    setProfileMessage, 
    selectedFoodImages, 
    foodImages,
    setSelectedFoodImages
}: ProfileEditProps) {
    const [tempMessage, setTempMessage] = useState(profileMessage);

    const handleSave = () => {
        setProfileMessage(tempMessage);
        toggleProfileEdit();
    };

    return (
        <View style={styles.container}>
            <View style={styles.placeholder}/>
            <View style={styles.editProfileContainer}>
                <View style={styles.editProfileMessage}>
                    <Text style={styles.titleText}>Edit Profile Message</Text>
                    <TextInput
                        style={styles.messageInput}
                        value={tempMessage}
                        onChangeText={setTempMessage}
                        placeholder="Enter your profile message..."
                        multiline={true}
                        maxLength={150}
                    />
                </View>

                <View style={styles.editProfileBackground}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                        <View style={styles.backgroundImageBackground}/>
                        <View style={styles.backgroundImageBackground}/>
                        <View style={styles.backgroundImageBackground}/>
                        <View style={styles.backgroundImageBackground}/>
                    </ScrollView>
                </View>
                <View style={styles.editProfileFood}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                        {foodImages.map((image, index) => (
                            <TouchableOpacity style={styles.foodImageBackground} key={index}>
                                <Image source={image} style={styles.foodImage}/>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
            <TouchableOpacity style={styles.editProfileButton} onPress={toggleProfileEdit}>
                <Text style={styles.editProfileButtonText}>Confirm</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0)',
    },
    editProfileContainer: {
        flex: 1.5,
        flexDirection: 'column',
        backgroundColor: colors.primaryColor,
        bottom: 120
    },
    editProfileMessage: {
        flex: 1.5,
        marginBottom: 10,
        padding: 10,
        backgroundColor: colors.secondaryColor,
    },
    titleText: {
        fontSize: 20,
        color: colors.black,
    },
    messageInput: {
        fontSize: 16,
        color: colors.black,
    },
    editProfileBackground: {
        flex: 3,
        backgroundColor: colors.secondaryColor,
        marginBottom: 10,
        padding: 10,
    },
    scrollContainer: {
        alignItems: 'center',
    },
    backgroundImageBackground: {
        width: Dimensions.get('window').width * 0.3,
        height: Dimensions.get('window').width * 0.3,
        backgroundColor: colors.white,
        borderRadius: Dimensions.get('window').width * 0.15,
        marginHorizontal: 10,
    },
    editProfileFood: {
        flex: 3.5,
        backgroundColor: colors.secondaryColor,
    },
    foodImageBackground: {
        width: Dimensions.get('window').width * 0.3,
        height: Dimensions.get('window').width * 0.3,
        backgroundColor: colors.white,
        borderRadius: Dimensions.get('window').width * 0.15,
        marginHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    foodImage: {
        width: Dimensions.get('window').width * 0.25,
        height: Dimensions.get('window').width * 0.25,
        resizeMode: 'center',
    },
    editProfileButton: {
        position: 'absolute',
        bottom: 30,
        width: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.brightBorder,
        padding: 20,
        borderRadius: 30,
    },
    editProfileButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },

})