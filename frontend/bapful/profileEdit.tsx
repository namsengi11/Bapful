import { View, Text, StyleSheet } from "react-native";

export default function ProfileEdit({ toggleProfileEdit }: { toggleProfileEdit: () => void }) {
    return (
        <View>
            <Text>Profile Edit</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0)',
    },
})