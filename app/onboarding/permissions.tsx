import { useRouter } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';

import { PHOTO_PERMISSION_MESSAGE } from '@/constants/permissions';
import { useMediaPermissions } from '@/features/swipe/hooks/useMediaPermissions';
import { useSettingsStore } from '@/stores/settingsStore';

export default function PermissionsScreen() {
  const router = useRouter();
  const setOnboarded = useSettingsStore((state) => state.setOnboarded);
  const { isRequesting, request } = useMediaPermissions();

  const onAllow = async () => {
    const result = await request();

    if (result.granted) {
      setOnboarded(false);
      router.replace('/onboarding/lock-setup');
      return;
    }

    Alert.alert(PHOTO_PERMISSION_MESSAGE.title, PHOTO_PERMISSION_MESSAGE.deniedHelp);
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text style={{ fontSize: 24, fontWeight: '700', color: '#2e3a46' }}>{PHOTO_PERMISSION_MESSAGE.title}</Text>
      <Text style={{ marginTop: 10, color: '#2e3a46' }}>{PHOTO_PERMISSION_MESSAGE.body}</Text>
      <Pressable
        onPress={onAllow}
        disabled={isRequesting}
        style={{ marginTop: 24, backgroundColor: '#0053e2', paddingVertical: 14, borderRadius: 12, alignItems: 'center', opacity: isRequesting ? 0.6 : 1 }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>{PHOTO_PERMISSION_MESSAGE.ctaAllow}</Text>
      </Pressable>
    </View>
  );
}
