import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function TextField({ label, error, style, ...rest }: TextFieldProps) {
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const negative = useThemeColor({}, 'negative');

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: muted }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={muted}
        style={[styles.input, { color: text, backgroundColor: card, borderColor: error ? negative : border }, style]}
        {...rest}
      />
      {error ? <Text style={[styles.error, { color: negative }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm + 2,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
  },
});
