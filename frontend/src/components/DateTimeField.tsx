import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

/** Native iOS/Android date + time picker. See DateTimeField.web.tsx for the browser version. */
export function DateTimeField({ value, onChange }: Props) {
  return (
    <DateTimePicker value={value} mode="datetime" display="compact" onValueChange={(_event, date) => onChange(date)} />
  );
}
