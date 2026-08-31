import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';

export function WelcomeScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.hero}>
          <ThemedText type="title">MoneyFlow</ThemedText>
          <ThemedText style={styles.subtitle}>Give every dollar a job.</ThemedText>
        </View>
        <View style={styles.actions}>
          <Button title="Log In" onPress={() => router.push('/login')} />
          <Button title="Create Account" variant="secondary" onPress={() => router.push('/register')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Spacing.xl,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  subtitle: {
    opacity: 0.7,
  },
  actions: {
    gap: Spacing.sm,
  },
});
