import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { firstDate, formatDisplayDate, type EventItem } from '../lib/events.ts';
import { colors, radius } from '../lib/theme.ts';
import { ShareButton } from './ShareButton.tsx';

export function EventCard({ event }: { event: EventItem }) {
  const date = firstDate(event);
  const moreDates = event.dates.length - 1;

  return (
    <View style={styles.card}>
      <Link href={`/events/${event.id}`} asChild>
        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <Image source={event.eventImage} style={styles.image} contentFit="cover" transition={150} />
          <View style={styles.body}>
            <Text style={styles.title} numberOfLines={2}>
              {event.title}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {date ? formatDisplayDate(date) : 'Date to be announced'}
              {moreDates > 0 ? ` · +${moreDates} more` : ''}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        </Pressable>
      </Link>
      <View style={styles.footer}>
        <ShareButton event={event} compact />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  pressed: {
    backgroundColor: colors.background,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.muted,
  },
  footer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    alignItems: 'flex-end',
  },
});
