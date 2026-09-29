import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { firstDate, formatDisplayDate, type EventItem } from '../lib/events.ts';
import { colors, radius } from '../lib/theme.ts';

/**
 * Highlighted events. The web mockup shows them in a right-hand sidebar; on a phone
 * they become a horizontal carousel above the main list.
 */
export function FeaturedEvents({ events }: { events: EventItem[] }) {
  if (events.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Featured</Text>
      <FlatList
        horizontal
        data={events}
        keyExtractor={(event) => String(event.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const date = firstDate(item);
          return (
            <Link href={`/events/${item.id}`} asChild>
              <Pressable accessibilityRole="button" style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                <Image source={item.eventImage} style={styles.image} contentFit="cover" transition={150} />
                <View style={styles.overlay}>
                  <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {date && <Text style={styles.date}>{formatDisplayDate(date)}</Text>}
                </View>
              </Pressable>
            </Link>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
    marginBottom: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 16,
  },
  list: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 260,
    height: 150,
    borderRadius: radius,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  date: {
    color: '#E5E7EB',
    fontSize: 12,
    marginTop: 2,
  },
});
