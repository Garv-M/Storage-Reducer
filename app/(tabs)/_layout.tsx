// Bottom-tab shell for the primary post-onboarding experience.
// Encapsulates icon behavior and tab accessibility labels in one place.

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors } from '@/ui/theme/colors';

type IoniconsName = keyof typeof Ionicons.glyphMap;

// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Returns a tab icon renderer that swaps filled/outline variants by focus state.
 * WHY: this keeps visual affordance consistent across tabs without repeating closures.
 */
function tabIcon(filled: IoniconsName, outline: IoniconsName) {
  return ({ color, focused }: { color: string; focused: boolean; size: number }) => (
    <Ionicons name={focused ? filled : outline} size={24} color={color} />
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
/**
 * Tabs layout used for Home, Trash, and Settings.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.blue100,
        tabBarInactiveTintColor: colors.gray100,
        tabBarStyle: {
          backgroundColor: colors.light.surfaceElevated,
          borderTopColor: colors.light.borderSubtle,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: tabIcon('home', 'home-outline'),
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />
      <Tabs.Screen
        name="trash"
        options={{
          title: 'Trash',
          tabBarIcon: tabIcon('trash', 'trash-outline'),
          tabBarAccessibilityLabel: 'Trash tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: tabIcon('settings', 'settings-outline'),
          tabBarAccessibilityLabel: 'Settings tab',
        }}
      />
    </Tabs>
  );
}
