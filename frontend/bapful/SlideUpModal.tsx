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
  backgroundColor?: string;
  backdropOpacity?: number;
};

export default function SlideUpModal({
  visible,
  onClose,
  children,
  backgroundColor = "#ffffff",
  backdropOpacity = 0.5,
}: SlideUpModalProps) {
  const MAX_MODAL_HEIGHT = screenHeight * 0.8;
  const slideAnimation = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnimation = useRef(new Animated.Value(0)).current;

  const CLOSE_VELOCITY_VY = 0.8;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        // Capture downward swipes that are primarily vertical
        const isPredominantlyVertical = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        const isDownward = gestureState.dy > 10; // Minimum 10px movement
        const hasMinimumMovement = Math.abs(gestureState.dy) > 5;
        return isPredominantlyVertical && isDownward && hasMinimumMovement;
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
        // Close if user dragged down enough or with sufficient velocity
        const draggedDownEnough = gestureState.dy > 100; // 100px threshold
        const fastDownwardFlick = gestureState.vy > CLOSE_VELOCITY_VY && gestureState.dy > 0;
        
        if (draggedDownEnough || fastDownwardFlick) {
          closeModal();
        } else {
          // Snap back to open position
          Animated.spring(slideAnimation, {
            toValue: 0,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  useEffect(() => {
    if (visible) openModal();
    else closeModal();
  }, [visible]);

  const openModal = () => {
    // Reset position off-screen
    slideAnimation.setValue(screenHeight);

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
        toValue: screenHeight,
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
      style={styles.modal}
      statusBarTranslucent={true}
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
                maxHeight: MAX_MODAL_HEIGHT,
                backgroundColor,
                transform: [{ translateY: slideAnimation }],
              },
            ]}
          >
            <View
              style={styles.swipeZone}
              {...panResponder.panHandlers}
            />

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    overflow: 'hidden',
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // overflow: 'hidden',
  },
  swipeZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
});
