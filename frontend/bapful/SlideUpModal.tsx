import React, { useEffect, useRef, ReactNode } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";

const { height: screenHeight } = Dimensions.get("window");

type SlideUpModalProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  height?: number;
  backgroundColor?: string;
  backdropOpacity?: number;
};

export default function SlideUpModal({
  visible,
  onClose,
  children,
  height = screenHeight * 0.8,
  backgroundColor = "#ffffff",
  backdropOpacity = 0.5,
}: SlideUpModalProps) {
  const slideAnimation = useRef(new Animated.Value(height)).current;
  const backdropAnimation = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        // Only respond to vertical gestures with lower threshold for better responsiveness
        return (
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          Math.abs(gestureState.dy) > 5
        );
      },
      onPanResponderMove: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          slideAnimation.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        // If dragged down more than half of modal height or with sufficient velocity, close modal
        if (gestureState.dy > screenHeight * 0.4 || gestureState.vy > 0.3) {
          closeModal();
        } else {
          // Otherwise, snap back to open position
          Animated.spring(slideAnimation, {
            toValue: 0,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      openModal();
    } else {
      closeModal();
    }
  }, [visible]);

  const openModal = () => {
    // Reset position
    slideAnimation.setValue(height);

    // Animate in
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(backdropAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: height,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(backdropAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleBackdropPress = () => {
    closeModal();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={closeModal}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, backdropOpacity],
                }),
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              height,
              backgroundColor,
              transform: [{ translateY: slideAnimation }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandleContainer: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#d0d0d0",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
