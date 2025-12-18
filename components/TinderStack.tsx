import React, { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';
import TinderCard from './TinderCard';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width - 80;
const CARD_HEIGHT = 400;
const SWIPE_LIMIT = width * 0.25;

const INITIAL_CARDS = [
    { id: 1, title: 'Card 1' },
    { id: 2, title: 'Card 2' },
    { id: 3, title: 'Card 3' },
];

const TinderStack = () => {
    const [cards, setCards] = useState(INITIAL_CARDS);
    const sharedTranslateX = useSharedValue(0);

    const handleSwipe = () => {
        setCards((prev) => {
            const next = [...prev];
            next.push(next.shift()!);
            return next;
        });
    };

    return (
        <View style={styles.container}>
            {cards
                .slice(0, 3)
                .map((card, index) => {
                    const isTop = index === 0;

                    if (isTop) {
                        return (
                            <TinderCard
                                key={card.id}
                                title={card.title}
                                onSwipe={handleSwipe}
                                sharedTranslateX={sharedTranslateX}
                            />
                        );
                    }

                    const animatedStyle = useAnimatedStyle(() => {
                        const progress = Math.min(
                            Math.abs(sharedTranslateX.value) / SWIPE_LIMIT,
                            1
                        );

                        return {
                            transform: [
                                { scale: 1 - index * 0.05 + progress * 0.05 },
                                { translateY: index * 12 - progress * 12 },
                            ],
                        };
                    });


                    return (
                        <Animated.View
                            key={card.id}
                            style={[styles.cardWrapper, animatedStyle]}
                        >
                            <View style={styles.placeholder} />
                        </Animated.View>
                    );
                })
                .reverse()}
        </View>
    );
};

export default TinderStack;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardWrapper: {
        position: 'absolute',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 20,
    },
    placeholder: {
        flex: 1,
        backgroundColor: '#E5E7EB',
        borderRadius: 20,
    },
});
