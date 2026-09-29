import { Alert, Linking, Pressable, StyleSheet, Text } from 'react-native';

import { twitterShareUrl, type EventItem } from '../lib/events.ts';
import { colors } from '../lib/theme.ts';

type Props = {
  event: Pick<EventItem, 'title' | 'dates'>;
  compact?: boolean;
};

/** Opens a Twitter/X compose window with "I'm going to EVENT @ DATE." */
export function ShareButton({ event, compact = false }: Props) {
  const share = async () => {
    try {
      await Linking.openURL(twitterShareUrl(event));
    } catch {
      Alert.alert('Unable to share', 'Could not open Twitter on this device.');
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Share ${event.title} on Twitter`}
      hitSlop={8}
      onPress={share}
      style={({ pressed }) => [styles.button, compact && styles.compact, pressed && styles.pressed]}
    >
      <Text style={[styles.label, compact && styles.compactLabel]}>{compact ? 'Share' : 'Share on Twitter'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.twitter,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  compact: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  compactLabel: {
    fontSize: 13,
  },
});
