import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { AccountTypeSelector } from '@/features/accounts/components/account-type-selector';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAccountsStore } from '@/stores/accounts-store';
import { useProfileStore } from '@/stores/profile-store';
import { AccountType } from '@/types';
import { toMajorUnits, toMinorUnits } from '@/utils/currency';

interface AddEditAccountScreenProps {
  accountId?: string;
}

export function AddEditAccountScreen({ accountId }: AddEditAccountScreenProps) {
  const isEditing = !!accountId;
  const existingAccount = useAccountsStore((s) =>
    accountId ? s.accounts.find((a) => a.id === accountId) : undefined
  );
  const addAccount = useAccountsStore((s) => s.addAccount);
  const updateAccount = useAccountsStore((s) => s.updateAccount);
  const profileCurrency = useProfileStore((s) => s.profile?.currency ?? 'USD');
  const muted = useThemeColor({}, 'muted');
  const negative = useThemeColor({}, 'negative');

  const [name, setName] = useState(existingAccount?.name ?? '');
  const [type, setType] = useState<AccountType>(existingAccount?.type ?? 'checking');
  const [balanceText, setBalanceText] = useState(
    existingAccount ? toMajorUnits(existingAccount.balance).toFixed(2) : '0.00'
  );
  const [nameError, setNameError] = useState<string | undefined>();
  const [balanceError, setBalanceError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isEditing && !existingAccount) {
    return (
      <Screen>
        <ThemedText style={{ color: negative }}>This account could not be found.</ThemedText>
      </Screen>
    );
  }

  const validate = () => {
    let valid = true;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Enter an account name.');
      valid = false;
    } else {
      setNameError(undefined);
    }

    const normalizedBalance = balanceText.trim().replace(/,/g, '');
    if (normalizedBalance === '' || Number.isNaN(Number(normalizedBalance))) {
      setBalanceError('Enter a valid amount, e.g. 100.00 or -50.00');
      valid = false;
    } else {
      setBalanceError(undefined);
    }

    return valid;
  };

  const handleSubmit = async () => {
    setSubmitError(undefined);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const balance = toMinorUnits(Number(balanceText.trim().replace(/,/g, '')));
      if (existingAccount) {
        await updateAccount(existingAccount.id, { name: name.trim(), type, balance });
      } else {
        await addAccount({ name: name.trim(), type, currency: profileCurrency, startingBalance: balance });
      }
      router.back();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.content}>
        <TextField
          label="Account Name"
          placeholder="e.g. Everyday Checking"
          value={name}
          onChangeText={setName}
          error={nameError}
        />

        <View style={styles.field}>
          <ThemedText style={[styles.label, { color: muted }]}>Account Type</ThemedText>
          <AccountTypeSelector value={type} onChange={setType} />
        </View>

        <TextField
          label={isEditing ? 'Current Balance' : 'Starting Balance'}
          placeholder="0.00"
          keyboardType="numbers-and-punctuation"
          value={balanceText}
          onChangeText={setBalanceText}
          error={balanceError}
        />

        {submitError ? <ThemedText style={{ color: negative }}>{submitError}</ThemedText> : null}

        <Button title={isEditing ? 'Save Changes' : 'Add Account'} onPress={handleSubmit} loading={isSubmitting} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  field: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
