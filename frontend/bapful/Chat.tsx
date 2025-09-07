import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Image,
  Keyboard,
  Animated,
} from "react-native";
import colors from "./colors";

type Message = {
  id: string;
  text: string;
  timestamp: Date;
  isFromCurrentUser: boolean;
};

type ChatProps = {
  recipientName: string;
  backgroundImage: any;
  onClose: () => void;
};

export default function Chat({ recipientName, backgroundImage, onClose }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! How are you?',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      isFromCurrentUser: false,
    },
    {
      id: '2',
      text: 'Hi! I\'m doing great, thanks! Just tried that Korean BBQ place you recommended.',
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      isFromCurrentUser: true,
    },
    {
      id: '3',
      text: 'I\'m glad to hear that! I\'m going to try it out too.',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      isFromCurrentUser: false,
    },
    {
      id: '4',
      text: 'I\'m glad to hear that! I\'m going to try it out too.',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      isFromCurrentUser: true,
    },
    {
      id: '5',
      text: 'I\'m glad to hear that! I\'m going to try it out too.',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      isFromCurrentUser: false,
    },
    {
      id: '6',
      text: 'I\'m glad to hear that! I\'m going to try it out too.',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      isFromCurrentUser: true,
    },
    {
      id: '7',
      text: 'I\'m glad to hear that! I\'m going to try it out too.',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      isFromCurrentUser: false,
    },
    {
      id: '8',
      text: 'I\'m glad to hear that! I\'m going to try it out too.',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      isFromCurrentUser: true,
    },
    {
      id: '9',
      text: 'I\'m glad to hear that! I\'m going to try it out too.',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      isFromCurrentUser: false,
    },
    {
      id: '10',
      text: 'I\'m glad to hear that! I\'m going to try it out too.',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      isFromCurrentUser: true,
    },
    {
      id: '11',
      text: 'I\'m glad to hear that! I\'m going to try it out too.',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      isFromCurrentUser: false,
    },
    {
      id: '12',
      text: 'I\'m glad to hear that! I\'m going to try it out too.',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      isFromCurrentUser: true,
    },
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        const height = e.endCoordinates.height + 10;
        setKeyboardHeight(height);
        Animated.timing(keyboardOffset, {
          toValue: -height,
          duration: 250,
          useNativeDriver: false,
        }).start();
        
        // Scroll to bottom when keyboard shows
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        Animated.timing(keyboardOffset, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    // Limit the message to 500 characters
    const lengthLimitedMessage = newMessage.slice(0, 500);

    const message: Message = {
      id: Date.now().toString(),
      text: lengthLimitedMessage,
      timestamp: new Date(),
      isFromCurrentUser: true,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
    console.log(messages);
    
    // Scroll to bottom after sending message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = (message: Message) => {
    if (message.isFromCurrentUser) {
      return (
        <View style={[styles.messageContainer, styles.sentMessage]}>
          <View style={[styles.messageBubble, styles.sentBubble]}>
            <Text style={styles.sentText}>{message.text}</Text>
          </View>
          <Text style={styles.sentTimestamp}>{formatTime(message.timestamp)}</Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.messageContainer, styles.receivedMessage]}>
          <View style={[styles.messageBubble, styles.receivedBubble]}>
            <Text style={styles.receivedText}>{message.text}</Text>
          </View>
          <Text style={styles.receivedTimestamp}>{formatTime(message.timestamp)}</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
        {/* Background Image */}
        <Image source={backgroundImage} style={styles.backgroundImage} />
      
        {/* Semi-transparent overlay */}
        <View style={styles.overlay} />
        
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chat with {recipientName}</Text>
        </View>

        <Animated.View 
            style={[
            styles.chatContainer,
            {
                transform: [{ translateY: keyboardOffset }]
            }
            ]}
        >

            {/* Messages */}
            <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            >
            {messages.map(renderMessage)}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
            <TextInput
                style={styles.textInput}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                placeholderTextColor={colors.gray}
                multiline
                maxLength={500}
            />
            <TouchableOpacity
                style={[
                styles.sendButton,
                newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive
                ]}
                onPress={sendMessage}
                disabled={!newMessage.trim()}
            >
                <Text style={[
                styles.sendButtonText,
                newMessage.trim() ? styles.sendButtonTextActive : styles.sendButtonTextInactive
                ]}>
                Send
                </Text>
            </TouchableOpacity>
            </View>
        </Animated.View>
    </View>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    // position: 'absolute',
    // top: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    height: screenHeight * 0.06,
    backgroundColor: colors.primaryColor,
    borderBottomWidth: 1,
    borderBottomColor: colors.brightBorder,
    zIndex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: screenHeight * 0.01,
    width: screenHeight * 0.04,
    height: screenHeight * 0.04,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.brightBorder,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brightBorder,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messagesContent: {
    paddingVertical: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 8,
  },
  sentMessage: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
  },
  receivedMessage: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: screenWidth * 0.75,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
  },
  sentBubble: {
    backgroundColor: colors.brightBorder,
    borderBottomRightRadius: 4,
    marginBottom: 2,
  },
  receivedBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    marginBottom: 2,
  },
  sentText: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 20,
  },
  receivedText: {
    color: colors.black,
    fontSize: 16,
    lineHeight: 20,
  },
  sentTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 2,
    marginRight: 4,
  },
  receivedTimestamp: {
    color: colors.gray,
    fontSize: 12,
    textAlign: 'left',
    marginTop: 2,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: colors.secondaryColor,
    minHeight: 60,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    color: colors.black,
    textAlignVertical: 'top',
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.brightBorder,
  },
  sendButtonInactive: {
    backgroundColor: colors.gray,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sendButtonTextActive: {
    color: colors.white,
  },
  sendButtonTextInactive: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
