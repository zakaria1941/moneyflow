import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ChipSelect } from '@/components/ui/chip-select';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import {
  TransactionFormType,
  TransactionTypeToggle,
} from '@/features/transactions/components/transaction-type-toggle';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAccountsStore } from '@/stores/accounts-store';
import { useCategoriesStore } from '@/stores/categories-store';
import { usePayeesStore } from '@/stores/payees-store';
import { useTransactionsStore } from '@/stores/transactions-store';
import { toMajorUnits, toMinorUnits } from '@/utils/currency';
import { todayISO } from '@/utils/date';

const NONE = '__none__';

// `new Date('2026-02-30')` doesn't return an invalid date — it silently rolls over to
// March 2nd, which would silently move the transaction (and the budget month it counts
// toward) to a date the user never typed. Reconstructing from the parsed parts and
// checking they round-trip catches that; a plain getTime()/NaN check does not.
function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

interface AddEditTransactionScreenProps {
  transactionId?: string;
}

export function AddEditTransactionScreen({ transactionId }: AddEditTransactionScreenProps) {
  const isEditing = !!transactionId;
  const existing = useTransactionsStore((s) =>
    transactionId ? s.transactions.find((t) => t.id === transactionId) : undefined
  );
  const transactionsLoading = useTransactionsStore((s) => s.isLoading);
  const accounts = useAccountsStore((s) => s.accounts);
  const categories = useCategoriesStore((s) => s.categories);
  const payees = usePayeesStore((s) => s.payees);
  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const updateTransaction = useTransactionsStore((s) => s.updateTransaction);
  const muted = useThemeColor({}, 'muted');
  const negative = useThemeColor({}, 'negative');

  const [type, setType] = useState<TransactionFormType>(
    existing ? (existing.amount >= 0 ? 'income' : 'expense') : 'expense'
  );
  const [amountText, setAmountText] = useState(existing ? toMajorUnits(Math.abs(existing.amount)).toFixed(2) : '');
  const [accountId, setAccountId] = useState<string | undefined>(existing?.accountId ?? accounts[0]?.id);
  // accounts can still be loading when this screen mounts (e.g. a fast tap right after
  // login), leaving accountId permanently unset since the useState initializer above only
  // runs once. Self-heal once the list arrives, without ever overriding a real selection.
  useEffect(() => {
    if (!accountId && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accountId, accounts]);
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? NONE);
  const [payeeId, setPayeeId] = useState(existing?.payeeId ?? NONE);
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [memo, setMemo] = useState(existing?.memo ?? '');
  // Same race, wider blast radius: when editing, the transactions store can still be
  // loading at mount (e.g. a deep link straight to an edit URL), so `existing` is
  // undefined on the very first render and every field above locks in a blank/"new
  // transaction" default instead of the real transaction's values — silently submitting
  // wrong data (or failing validation on the now-empty amount) if the user hits save
  // without noticing. Once the real record arrives, hydrate the form from it exactly
  // once, the same self-heal idea as accountId above but covering every field.
  const [hasHydratedExisting, setHasHydratedExisting] = useState(false);
  useEffect(() => {
    if (isEditing && existing && !hasHydratedExisting) {
      setType(existing.amount >= 0 ? 'income' : 'expense');
      setAmountText(toMajorUnits(Math.abs(existing.amount)).toFixed(2));
      setAccountId(existing.accountId);
      setCategoryId(existing.categoryId ?? NONE);
      setPayeeId(existing.payeeId ?? NONE);
      setDate(existing.date);
      setMemo(existing.memo ?? '');
      setHasHydratedExisting(true);
    }
  }, [isEditing, existing, hasHydratedExisting]);

  const [amountError, setAmountError] = useState<string | undefined>();
  const [accountError, setAccountError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isEditing && !existing) {
    return (
      <Screen>
        <View style={styles.centered}>
          {transactionsLoading ? (
            <ActivityIndicator />
          ) : (
            <ThemedText style={{ color: negative }}>This transaction could not be found.</ThemedText>
          )}
        </View>
      </Screen>
    );
  }

  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }));
  // Hidden categories are excluded from new selections, but if this transaction is
  // already tagged with one (hidden after the transaction was created), keep it in the
  // list so the current selection stays visible instead of silently vanishing.
  const selectableCategories = categories.filter((c) => !c.hidden || c.id === existing?.categoryId);
  const categoryOptions = [{ value: NONE, label: 'None' }, ...selectableCategories.map((c) => ({ value: c.id, label: c.name }))];
  // Same idea for archived payees — excluded from new selections, but kept visible if
  // this transaction is already tagged with one.
  const selectablePayees = payees.filter((p) => !p.archived || p.id === existing?.payeeId);
  const payeeOptions = [{ value: NONE, label: 'None' }, ...selectablePayees.map((p) => ({ value: p.id, label: p.name }))];

  const validate = () => {
    let valid = true;

    const amount = Number(amountText.trim());
    if (amountText.trim() === '' || Number.isNaN(amount) || amount <= 0) {
      setAmountError('Enter an amount greater than 0.');
      valid = false;
    } else {
      setAmountError(undefined);
    }

    if (!accountId) {
      setAccountError('Select an account.');
      valid = false;
    } else {
      setAccountError(undefined);
    }

    if (!isValidCalendarDate(date)) {
      setDateError('Enter a valid date as YYYY-MM-DD.');
      valid = false;
    } else {
      setDateError(undefined);
    }

    return valid;
  };

  const handleSubmit = async () => {
    setSubmitError(undefined);
    if (!validate() || !accountId) return;

    setIsSubmitting(true);
    try {
      const magnitude = toMinorUnits(Number(amountText.trim()));
      const amount = type === 'expense' ? -magnitude : magnitude;
      const payload = {
        accountId,
        categoryId: categoryId === NONE ? undefined : categoryId,
        payeeId: payeeId === NONE ? undefined : payeeId,
        amount,
        date,
        memo: memo.trim() ? memo.trim() : undefined,
      };

      if (existing) {
        await updateTransaction(existing.id, payload);
      } else {
        await addTransaction(payload);
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
        <TransactionTypeToggle value={type} onChange={setType} />

        <TextField
          label="Amount"
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amountText}
          onChangeText={setAmountText}
          error={amountError}
        />

        <View style={styles.field}>
          <ThemedText style={[styles.label, { color: muted }]}>Account</ThemedText>
          {accounts.length === 0 ? (
            <View style={styles.noAccounts}>
              <ThemedText style={{ color: muted }}>You need an account before you can add a transaction.</ThemedText>
              <Button title="Add Account" variant="secondary" onPress={() => router.push('/account/new')} />
            </View>
          ) : (
            <ChipSelect options={accountOptions} value={accountId} onChange={setAccountId} />
          )}
          {accountError ? <ThemedText style={{ color: negative }}>{accountError}</ThemedText> : null}
        </View>

        <View style={styles.field}>
          <ThemedText style={[styles.label, { color: muted }]}>Category</ThemedText>
          <ChipSelect options={categoryOptions} value={categoryId} onChange={setCategoryId} />
        </View>

        <View style={styles.field}>
          <ThemedText style={[styles.label, { color: muted }]}>Payee</ThemedText>
          <ChipSelect options={payeeOptions} value={payeeId} onChange={setPayeeId} />
        </View>

        <TextField
          label="Date"
          placeholder="YYYY-MM-DD"
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
          value={date}
          onChangeText={setDate}
          error={dateError}
        />

        <TextField label="Memo (optional)" placeholder="Add a note" value={memo} onChangeText={setMemo} />

        {submitError ? <ThemedText style={{ color: negative }}>{submitError}</ThemedText> : null}

        <Button title={isEditing ? 'Save Changes' : 'Add Transaction'} onPress={handleSubmit} loading={isSubmitting} />
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
  noAccounts: {
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
