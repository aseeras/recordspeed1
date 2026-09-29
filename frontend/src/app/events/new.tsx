import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { createEvent } from '../../lib/api.ts';
import {
  formatDisplayDate,
  parseEventDate,
  toEventDateString,
  validateNewEvent,
  type EventFormErrors,
  type NewEvent,
} from '../../lib/events.ts';
import { colors, radius } from '../../lib/theme.ts';

function nextFullHour() {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return date;
}

export default function NewEventScreen() {
  const [form, setForm] = useState<NewEvent>({
    title: '',
    description: '',
    location: '',
    eventImage: '',
    dates: [],
  });
  const [pickerValue, setPickerValue] = useState(nextFullHour);
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof NewEvent>(key: K, value: NewEvent[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const addDate = () => {
    const value = toEventDateString(pickerValue);
    if (!form.dates.includes(value)) {
      const dates = [...form.dates, value].sort(
        (a, b) => (parseEventDate(a)?.getTime() ?? 0) - (parseEventDate(b)?.getTime() ?? 0),
      );
      update('dates', dates);
    }
  };

  const removeDate = (value: string) =>
    update(
      'dates',
      form.dates.filter((d) => d !== value),
    );

  const save = async () => {
    const trimmed: NewEvent = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      eventImage: form.eventImage.trim(),
    };
    const validation = validateNewEvent(trimmed);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSaving(true);
    try {
      const created = await createEvent(trimmed);
      router.replace(`/events/${created.id}`);
    } catch (e) {
      Alert.alert('Could not create event', e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  const imageUrl = form.eventImage.trim();

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.headerButton}>Cancel</Text>
            </Pressable>
          ),
          headerRight: () =>
            saving ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Pressable accessibilityRole="button" onPress={save} hitSlop={8}>
                <Text style={[styles.headerButton, styles.bold]}>Save</Text>
              </Pressable>
            ),
        }}
      />
      <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={100}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Field
            label="Title"
            error={errors.title}
            value={form.title}
            onChangeText={(v) => update('title', v)}
            placeholder="Jazz night at the park"
            returnKeyType="next"
          />
          <Field
            label="Description"
            error={errors.description}
            value={form.description}
            onChangeText={(v) => update('description', v)}
            placeholder="What is the event about?"
            multiline
            style={styles.multiline}
          />
          <Field
            label="Place"
            error={errors.location}
            value={form.location}
            onChangeText={(v) => update('location', v)}
            placeholder="Auditorio del SODRE"
          />

          <View style={styles.field}>
            <Text style={styles.label}>Dates</Text>
            <View style={styles.pickerRow}>
              <DateTimePicker
                value={pickerValue}
                mode="datetime"
                display="compact"
                onValueChange={(_event, date) => setPickerValue(date)}
              />
              <Pressable accessibilityRole="button" onPress={addDate} style={styles.addDate}>
                <Text style={styles.addDateLabel}>Add date</Text>
              </Pressable>
            </View>
            {form.dates.map((value) => {
              const date = parseEventDate(value);
              return (
                <View key={value} style={styles.dateRow}>
                  <Text style={styles.dateText}>{date ? formatDisplayDate(date) : value}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${value}`}
                    onPress={() => removeDate(value)}
                    hitSlop={8}
                  >
                    <Text style={styles.remove}>Remove</Text>
                  </Pressable>
                </View>
              );
            })}
            {errors.dates && <Text style={styles.error}>{errors.dates}</Text>}
          </View>

          <Field
            label="Picture URL"
            error={errors.eventImage}
            value={form.eventImage}
            onChangeText={(v) => update('eventImage', v)}
            placeholder="https://example.com/poster.jpg"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          {/^https?:\/\/\S+$/i.test(imageUrl) && (
            <Image source={imageUrl} style={styles.preview} contentFit="cover" transition={150} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

function Field({ label, error, style, ...props }: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[styles.input, error && styles.inputError, style]}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 18,
    paddingBottom: 48,
  },
  headerButton: {
    color: colors.primary,
    fontSize: 17,
  },
  bold: {
    fontWeight: '600',
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  addDate: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  addDateLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 15,
    color: colors.text,
  },
  remove: {
    color: colors.danger,
    fontWeight: '500',
  },
  preview: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius,
    backgroundColor: colors.border,
  },
});
