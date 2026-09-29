import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ShareButton } from '../../components/ShareButton.tsx';
import { ErrorView, LoadingView } from '../../components/StatusView.tsx';
import { fetchEvent } from '../../lib/api.ts';
import { formatDisplayDate, sortedDates } from '../../lib/events.ts';
import { colors, radius } from '../../lib/theme.ts';
import { useAsync } from '../../lib/useAsync.ts';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const load = useCallback(() => fetchEvent(id), [id]);
  const { data: event, error, loading, reload } = useAsync(load, [load]);

  if (loading && !event) return <LoadingView />;
  if (error || !event) return <ErrorView message={error?.message ?? 'Event not found'} onRetry={reload} />;

  const dates = sortedDates(event);

  return (
    <>
      <Stack.Screen options={{ title: event.title }} />
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
        <Image source={event.eventImage} style={styles.image} contentFit="cover" transition={150} />
        <Text style={styles.title}>{event.title}</Text>
        <ShareButton event={event} />

        <Section label="Place">
          <Text style={styles.body}>{event.location}</Text>
        </Section>

        <Section label={dates.length === 1 ? 'Date' : 'Dates'}>
          {dates.length > 0 ? (
            dates.map((date) => (
              <Text key={date.getTime()} style={styles.body}>
                • {formatDisplayDate(date)}
              </Text>
            ))
          ) : (
            <Text style={styles.body}>To be announced</Text>
          )}
        </Section>

        <Section label="Description">
          <Text style={styles.body}>{event.description}</Text>
        </Section>
      </ScrollView>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius,
    backgroundColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    padding: 14,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
});
