import React from "react";
import { Dimensions, StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    interpolate,
    runOnJS,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const SWIPE_LIMIT = width * 0.25;
const VELOCITY_LIMIT = 800;

type Props = {
    title: string;
    onSwipe: () => void;
    sharedTranslateX: SharedValue<number>;
};

const TinderCard = ({ title, onSwipe, sharedTranslateX }: Props) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            translateX.value = e.translationX;
            translateY.value = e.translationY;
            sharedTranslateX.value = e.translationX;
        })
        .onEnd((event) => {
            const shouldSwipe =
                Math.abs(translateX.value) > SWIPE_LIMIT ||
                Math.abs(event.velocityX) > VELOCITY_LIMIT;

            if (shouldSwipe) {
                const direction =
                    event.velocityX > 0 || translateX.value > 0 ? width : -width;

                translateX.value = withSpring(
                    direction,
                    { velocity: event.velocityX },
                    () => runOnJS(onSwipe)()
                );
            } else {
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                sharedTranslateX.value = withSpring(0);
            }
        });

    // LIKE Overlay
    const likeStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [0, SWIPE_LIMIT], [0, 1], "clamp"),
        transform: [
            {
                scale: interpolate(
                    translateX.value,
                    [0, SWIPE_LIMIT],
                    [0.8, 1],
                    "clamp"
                ),
            },
        ],
    }));

    // NOPE Overlay
    const nopeStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [-SWIPE_LIMIT, 0], [1, 0], "clamp"),
        transform: [
            {
                scale: interpolate(
                    translateX.value,
                    [-SWIPE_LIMIT, 0],
                    [1, 0.8],
                    "clamp"
                ),
            },
        ],
    }));

    const cardStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            translateX.value,
            [-width, 0, width],
            [-15, 0, 15]
        );

        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: `${rotate}deg` },
            ],
        };
    });

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.card, cardStyle]}>
                <Animated.View style={[styles.likeBadge, likeStyle]}>
                    <Text style={styles.likeText}>❤️</Text>
                </Animated.View>

                <Animated.View style={[styles.nopeBadge, nopeStyle]}>
                    <Text style={styles.nopeText}>❌</Text>
                </Animated.View>

                <Text style={styles.text}>{title}</Text>
            </Animated.View>
        </GestureDetector>
    );
};

export default TinderCard;

const styles = StyleSheet.create({
    card: {
        width: width - 80,
        height: 400,
        backgroundColor: "#FFF",
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
    },

    likeBadge: {
        position: "absolute",
        top: 30,
        left: 20,
        // borderWidth: 4,
        // borderColor: '#22C55E',
        padding: 10,
        borderRadius: 8,
        transform: [{ rotate: "-15deg" }],
    },
    likeText: {
        color: "#22C55E",
        fontSize: 28,
        fontWeight: "bold",
    },

    nopeBadge: {
        position: "absolute",
        top: 30,
        right: 20,
        // borderWidth: 4,
        // borderColor: '#EF4444',
        padding: 10,
        borderRadius: 8,
        transform: [{ rotate: "15deg" }],
    },
    nopeText: {
        color: "#EF4444",
        fontSize: 28,
        fontWeight: "bold",
    },
});
