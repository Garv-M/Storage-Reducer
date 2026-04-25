import { useEffect, useState } from 'react';

import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { PinPad } from '@/features/lock/components/PinPad';
import { AppLockService } from '@/services/auth/AppLockService';
import { getBiometricType, isBiometricAvailable } from '@/services/auth/biometric';
import { loadPinLength } from '@/services/auth/pinHash';
import { useLockStore } from '@/stores/lockStore';

interface LockScreenContentProps {
  onUnlocked?: () => void;
}

export function LockScreenContent({ onUnlocked }: LockScreenContentProps) {
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | 'iris' | null>(null);
  const [pinLength, setPinLength] = useState<number | null>(null);

  const biometricEnabled = useLockStore((state) => state.biometricEnabled);

  const unlockAndContinue = () => {
    onUnlocked?.();
  };

  const tryBiometric = async () => {
    const unlocked = await AppLockService.unlock('biometric');
    if (unlocked) {
      unlockAndContinue();
    }
  };

  useEffect(() => {
    void (async () => {
      const available = await isBiometricAvailable();
      setBiometricAvailable(available);
      if (available) {
        setBiometricType(await getBiometricType());
      }

      const storedLength = await loadPinLength();
      setPinLength(storedLength);

      if (available && biometricEnabled) {
        await tryBiometric();
      }
    })();
  }, [biometricEnabled]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: '#2e3a46' }}>Unlock Storage Reducer</Text>
      <Text style={{ marginTop: 8, marginBottom: 22, color: '#2e3a46' }}>Enter your PIN to continue.</Text>

      <PinPad
        minLength={pinLength ?? 4}
        maxLength={pinLength ?? 6}
        biometricAvailable={biometricAvailable && biometricEnabled}
        biometricType={biometricType}
        onBiometric={() => {
          void tryBiometric();
        }}
        onSubmitPin={async (pin) => {
          const unlocked = await AppLockService.unlock('pin', pin);
          if (unlocked) {
            unlockAndContinue();
          }
          return unlocked;
        }}
      />
    </View>
  );
}

export default function LockScreen() {
  const router = useRouter();
  return <LockScreenContent onUnlocked={() => router.back()} />;
}
