import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

interface AnimatedBackgroundProps {
  images: number[];
  delay?: number; // Delay in milliseconds between image changes
}

export default function AnimatedBackground({ 
  images, 
  delay = 2500
}: AnimatedBackgroundProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval - instant switch, no animation
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const next = (prevIndex + 1) % images.length;
        return next; // Instant state update, no animation
      });
    }, delay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images, delay]);

  // Render all images stacked, only current one visible
  return (
    <View style={styles.container}>
      {images.map((img, index) => (
        <View
          key={index}
          style={[
            styles.imageContainer,
            index !== currentIndex && { opacity: 0, pointerEvents: 'none' },
          ]}
        >
          <Image
            source={img}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.overlay} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
});
