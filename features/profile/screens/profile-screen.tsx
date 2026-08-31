import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChipSelect } from '@/components/ui/chip-select';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuthStore } from '@/stores/auth-store';
import { useProfileStore } from '@/stores/profile-store';
import { SUPPORTED_CURRENCIES } from '@/utils/currency';

const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((code) => ({ value: code, label: code }));

export function ProfileScreen() {
  const profile = useProfileStore((s) => s.profile);
  const isProfileLoading = useProfileStore((s) => s.isLoading);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const logout = useAuthStore((s) => s.logout);

  const negative = useThemeColor({}, 'negative');
  const positive = useThemeColor({}, 'positive');
  const muted = useThemeColor({}, 'muted');

  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSaveError, setNameSaveError] = useState<string | undefined>();

  const [isSavingCurrency, setIsSavingCurrency] = useState(false);
  const [currencyError, setCurrencyError] = useState<string | undefined>();

  if (isProfileLoading && !profile) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  const startEditName = () => {
    setDraftName(profile?.displayName ?? '');
    setNameError(undefined);
    setNameSaveError(undefined);
    setIsEditingName(true);
  };

  const cancelEditName = () => {
    setIsEditingName(false);
    setNameError(undefined);
  };

  const saveName = async () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      setNameError('Enter a name.');
      return;
    }
    setIsSavingName(true);
    setNameSaveError(undefined);
    try {
      await updateProfile({ displayName: trimmed });
      setIsEditingName(false);
    } catch (err) {
      // Left in edit mode with the typed value intact so nothing is lost.
      setNameSaveError(err instanceof Error ? err.message : 'Could not save. Please try again.');
    } finally {
      setIsSavingName(false);
    }
  };

  const changeCurrency = async (currency: string) => {
    if (currency === profile?.currency) return;
    setIsSavingCurrency(true);
    setCurrencyError(undefined);
    try {
      await updateProfile({ currency });
    } catch (err) {
      setCurrencyError(err instanceof Error ? err.message : 'Could not save. Please try again.');
    } finally {
      setIsSavingCurrency(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.content}>
        <ThemedText type="title">Profile</ThemedText>

        <Card style={styles.card}>
          {isEditingName ? (
            <View style={styles.editRow}>
              <View style={styles.editField}>
                <TextField
                  label="Name"
                  placeholder="Your name"
                  value={draftName}
                  onChangeText={setDraftName}
                  error={nameError}
                  autoFocus
                />
              </View>
              <Pressable onPress={saveName} disabled={isSavingName} style={styles.iconButton} hitSlop={8}>
                <Ionicons name="checkmark" size={22} color={positive} />
              </Pressable>
              <Pressable onPress={cancelEditName} disabled={isSavingName} style={styles.iconButton} hitSlop={8}>
                <Ionicons name="close" size={22} color={negative} />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={startEditName} style={styles.row}>
              <ThemedText style={styles.rowLabel}>Name</ThemedText>
              <View style={styles.rowValue}>
                <ThemedText type="defaultSemiBold">{profile?.displayName ?? '—'}</ThemedText>
                <Ionicons name="pencil-outline" size={14} color={muted} />
              </View>
            </Pressable>
          )}
          {nameSaveError ? <ThemedText style={{ color: negative }}>{nameSaveError}</ThemedText> : null}

          <View style={styles.row}>
            <ThemedText style={styles.rowLabel}>Email</ThemedText>
            <ThemedText type="defaultSemiBold">{profile?.email ?? '—'}</ThemedText>
          </View>
        </Card>

        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Preferences
        </ThemedText>
        <Card style={styles.card}>
          <ThemedText style={styles.rowLabel}>Currency</ThemedText>
          <ChipSelect options={CURRENCY_OPTIONS} value={profile?.currency} onChange={changeCurrency} />
          {isSavingCurrency ? <ActivityIndicator size="small" style={styles.currencySpinner} /> : null}
          {currencyError ? <ThemedText style={{ color: negative }}>{currencyError}</ThemedText> : null}
        </Card>

        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Budgeting
        </ThemedText>
        <Button title="Manage Payees" variant="secondary" onPress={() => router.push('/payee')} />

        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Account
        </ThemedText>
        <Button title="Log Out" variant="secondary" onPress={() => logout()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  card: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  rowLabel: {
    opacity: 0.6,
  },
  rowValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  editField: {
    flex: 1,
  },
  iconButton: {
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  currencySpinner: {
    alignSelf: 'flex-start',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
