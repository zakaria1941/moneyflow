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

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const negative = useThemeColor({}, 'negative');

  const handleSubmit = () => {
    login(email, password).catch(() => {
      // error message is already captured in the store
    });
  };

  return (
    <Screen scroll>
      <View style={styles.content}>
        <ThemedText type="title">Welcome back</ThemedText>
        <View style={styles.form}>
          <TextField
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Password"
            placeholder="At least 4 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <ThemedText style={{ color: negative }}>{error}</ThemedText> : null}
          <Button title="Log In" onPress={handleSubmit} loading={isLoading} />
        </View>
        <View style={styles.links}>
          <Button title="Forgot password?" variant="secondary" onPress={() => router.push('/forgot-password')} />
          <Button title="Need an account? Register" variant="secondary" onPress={() => router.push('/register')} />
        </View>
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
  form: {
    gap: Spacing.sm,
  },
  links: {
    gap: Spacing.sm,
  },
});
