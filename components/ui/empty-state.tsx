import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';

interface EmptyStateProps {
  title: string;
  message?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="cardTitle">{title}</ThemedText>
      {message ? (
        <ThemedText type="default" style={styles.message}>
          {message}
        </ThemedText>
      ) : null}
      {action ? (
        <View style={styles.action}>
          <Button title={action.label} onPress={action.onPress} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.xs,
  },
  message: {
    opacity: 0.6,
    textAlign: 'center',
  },
  action: {
    marginTop: Spacing.sm,
    minWidth: 180,
  },
});
