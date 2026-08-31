import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type IconPair = { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap };

const ICONS: Record<'index' | 'accounts' | 'budget' | 'reports' | 'profile', IconPair> = {
  index: { active: 'home', inactive: 'home-outline' },
  accounts: { active: 'wallet', inactive: 'wallet-outline' },
  budget: { active: 'pie-chart', inactive: 'pie-chart-outline' },
  reports: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  profile: { active: 'person-circle', inactive: 'person-circle-outline' },
};

function tabIcon(name: keyof typeof ICONS) {
  function TabIcon({ color, size, focused }: { color: string; size: number; focused: boolean }) {
    return <Ionicons name={focused ? ICONS[name].active : ICONS[name].inactive} size={size} color={color} />;
  }
  return TabIcon;
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarLabelStyle: styles.label,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: tabIcon('index') }} />
      <Tabs.Screen name="accounts" options={{ title: 'Accounts', tabBarIcon: tabIcon('accounts') }} />
      <Tabs.Screen name="budget" options={{ title: 'Budget', tabBarIcon: tabIcon('budget') }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports', tabBarIcon: tabIcon('reports') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('profile') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
