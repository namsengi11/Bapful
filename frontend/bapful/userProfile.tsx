import { Image, StyleSheet, Text, TouchableOpacity, View, DimensionValue, Dimensions } from "react-native";
import { useState, useEffect } from "react";

import UserProfileList from "./UserProfileList";
import ProfileEdit from "./ProfileEdit";
import Chat from "./Chat";
import colors from "./colors";
import { User } from "./User";

type UserProfileProps = {
    myProfile: Boolean;
    user: User;
}

export default function UserProfile({
        myProfile,
        user,
    }: UserProfileProps
) {
    const foodCoordinates: Array<[DimensionValue, DimensionValue]> = [['15%', '62%'], ['50%', '62%'], ['0%', '75%'], ['33%', '75%'], ['65%', '75%']];

    // Available food images - create a mapping for dynamic imports
    const foodImageMap: { [key: string]: any } = {
        './assets/foods/bossam.png': require('./assets/foods/bossam.png'),
        './assets/foods/japchae.png': require('./assets/foods/japchae.png'),
        './assets/foods/samgyetang.png': require('./assets/foods/samgyetang.png'),
        './assets/foods/soondubu.png': require('./assets/foods/soondubu.png'),
        './assets/foods/tbk.png': require('./assets/foods/tbk.png'),
        './assets/foods/yukheue.png': require('./assets/foods/yukheue.png'),
    };

    const backgroundImageMap: { [key: string]: any } = {
        './assets/backgrounds/namsan_tower.png': require('./assets/backgrounds/namsan_tower.png'),
        './assets/backgrounds/palace.png': require('./assets/backgrounds/palace.png'),
        './assets/backgrounds/hanok.png': require('./assets/backgrounds/hanok.png'),

    };
    
    const foodImages = user.foodImages.map((imagePath) => foodImageMap[imagePath]).filter(Boolean);
    const backgroundImage = backgroundImageMap[user.backgroundImage];

    const [selectedFoodImages, setSelectedFoodImages] = useState<any[]>([foodImages[0], foodImages[1], foodImages[2], foodImages[3], foodImages[4]]);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState("Welcome to my food journey!");
    const [isChatting, setIsChatting] = useState(false);

    const toggleProfileEdit = () => {
        setIsEditingProfile(!isEditingProfile);
    }

    const toggleChat = () => {
        setIsChatting(!isChatting);
        console.log(isChatting);
    }

    return (
        <View style={styles.container}>
            <Image source={backgroundImage} style={styles.backgroundImage} />
            <View style={styles.userProfileListContainer}>
                <UserProfileList users={[]} />
            </View>
            <View style={styles.profileMessageContainer}>
                <Text style={styles.profileMessageText}>{user.statusMessage}</Text>
            </View>
            {foodCoordinates.map((coordinate, index) => (
                <View key={index} style={[styles.foodCoordinate, { left: coordinate[0], top: coordinate[1] }]}>
                    {selectedFoodImages[index] && (
                        <Image 
                            source={selectedFoodImages[index]} 
                            style={styles.foodImage}
                        />
                    )}
                </View>
            ))}
            {myProfile && (
            <TouchableOpacity style={styles.editProfileButton} onPress={toggleProfileEdit}>
                <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            )}
            {!myProfile && (
            <TouchableOpacity style={styles.editProfileButton} onPress={toggleChat}>
                <Text style={styles.editProfileButtonText}>Chat</Text>
            </TouchableOpacity>
            )}
            {myProfile && isEditingProfile && <ProfileEdit 
                toggleProfileEdit={toggleProfileEdit} 
                profileMessage={profileMessage} 
                setProfileMessage={setProfileMessage} 
                selectedFoodImages={selectedFoodImages} 
                foodImages={foodImages} 
                setSelectedFoodImages={setSelectedFoodImages} 
            />}
            {!myProfile && isChatting && (
                <Chat 
                    recipientName={user.name}
                    backgroundImage={backgroundImage}
                    onClose={toggleChat}
                />
            )}
        </View>
        
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    userProfileListContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        paddingTop: 10,
        paddingBottom: 10,
        width: '100%',
        // height: '10%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
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
    profileMessageContainer: {
        position: 'absolute',
        top: '15%',
        left: '10%',
        right: '10%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    profileMessageText: {
        fontSize: 16,
        color: colors.gray,
        textAlign: 'center',
        fontWeight: '500',
    },
    foodCoordinate: {
        position: 'absolute',
        width: Dimensions.get('window').height * 0.13,
        height: Dimensions.get('window').height * 0.13,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    foodImage: {
        width: '110%',
        height: '90%',
    }
})