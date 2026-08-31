import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';

interface PlaceholderScreenProps {
  title: string;
  message?: string;
}

export function PlaceholderScreen({ title, message = 'Coming in a follow-up pass.' }: PlaceholderScreenProps) {
  return (
    <Screen>
      <View style={styles.center}>
        <EmptyState title={title} message={message} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
