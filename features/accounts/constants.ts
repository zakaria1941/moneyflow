import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { AccountType } from '@/types';

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  checking: 'Checking',
  savings: 'Savings',
  cash: 'Cash',
  credit_card: 'Credit Card',
};

export const ACCOUNT_TYPE_ICON: Record<AccountType, ComponentProps<typeof Ionicons>['name']> = {
  checking: 'business-outline',
  savings: 'trending-up-outline',
  cash: 'cash-outline',
  credit_card: 'card-outline',
};
