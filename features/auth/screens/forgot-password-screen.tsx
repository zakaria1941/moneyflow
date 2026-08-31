import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuthStore } from '@/stores/auth-store';

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const negative = useThemeColor({}, 'negative');
  const positive = useThemeColor({}, 'positive');

  const handleSubmit = () => {
    requestPasswordReset(email)
      .then(() => setSent(true))
      .catch(() => {
        // error message is already captured in the store
      });
  };

  return (
    <Screen scroll>
      <View style={styles.content}>
        <ThemedText type="title">Reset your password</ThemedText>
        <ThemedText style={styles.subtitle}>We&apos;ll send a reset link to your email.</ThemedText>
        <View style={styles.form}>
          <TextField
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          {error ? <ThemedText style={{ color: negative }}>{error}</ThemedText> : null}
          {sent ? <ThemedText style={{ color: positive }}>Check your inbox for a reset link.</ThemedText> : null}
          <Button title="Send Reset Link" onPress={handleSubmit} loading={isLoading} />
        </View>
        <Button title="Back to Log In" variant="secondary" onPress={() => router.push('/login')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: -Spacing.md,
  },
  form: {
    gap: Spacing.sm,
  },
});
