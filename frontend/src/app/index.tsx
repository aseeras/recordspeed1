import { Link, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { EventCard } from '../components/EventCard.tsx';
import { FeaturedEvents } from '../components/FeaturedEvents.tsx';
import { ErrorView, LoadingView } from '../components/StatusView.tsx';
import { API_URL, fetchEvents, fetchFeaturedEvents, isUsingDemoData } from '../lib/api.ts';
import { sortEventsByDate } from '../lib/events.ts';
import { colors } from '../lib/theme.ts';
import { useAsync } from '../lib/useAsync.ts';

async function loadHome() {
  const [events, featured] = await Promise.all([fetchEvents(), fetchFeaturedEvents()]);
  return { events: sortEventsByDate(events), featured: sortEventsByDate(featured), demo: isUsingDemoData() };
}

export default function HomeScreen() {
  const { data, error, loading, reload } = useAsync(loadHome);

  // Refresh when coming back to the list, e.g. after creating an event.
  const hasFocused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (hasFocused.current) reload();
      hasFocused.current = true;
    }, [reload]),
  );

  const header = useMemo(
    () => (
      <>
        {data?.demo && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Showing demo events: the events server at {API_URL} isn't running. Start it with "npm start" in
              backend/, then pull down to refresh.
            </Text>
          </View>
        )}
        <FeaturedEvents events={data?.featured ?? []} />
        <Text style={styles.heading}>All events</Text>
      </>
    ),
    [data?.featured, data?.demo],
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href="/events/new" asChild>
              <Pressable accessibilityRole="button" accessibilityLabel="Create event" hitSlop={8}>
                <Text style={styles.addButton}>New</Text>
              </Pressable>
            </Link>
          ),
        }}
      />
      {!data && loading ? (
        <LoadingView />
      ) : !data && error ? (
        <ErrorView message={error.message} onRetry={reload} />
      ) : (
        <FlatList
          data={data?.events ?? []}
          keyExtractor={(event) => String(event.id)}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <EventCard event={item} />
            </View>
          )}
          ListHeaderComponent={header}
          ListEmptyComponent={<Text style={styles.empty}>No events yet. Tap “New” to create one.</Text>}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={<RefreshControl refreshing={loading && !!data} onRefresh={reload} />}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  item: {
    paddingHorizontal: 16,
  },
  notice: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFF4D6',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8C66A',
  },
  noticeText: {
    color: '#6B4E00',
    fontSize: 13,
    lineHeight: 18,
  },
  separator: {
    height: 12,
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    padding: 24,
  },
  addButton: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '600',
  },
});
