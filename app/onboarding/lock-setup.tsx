import { useEffect, useState } from 'react';

import { useRouter } from 'expo-router';
import { Pressable, Switch, Text, TextInput, View } from 'react-native';

import { AppLockService } from '@/services/auth/AppLockService';
import { isBiometricAvailable } from '@/services/auth/biometric';
import { useSettingsStore } from '@/stores/settingsStore';

export default function LockSetupScreen() {
  const router = useRouter();
  const setOnboarded = useSettingsStore((state) => state.setOnboarded);

  const [step, setStep] = useState<'pin' | 'confirm'>('pin');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [enableBiometric, setEnableBiometric] = useState(true);

  useEffect(() => {
    void (async () => {
      const available = await isBiometricAvailable();
      setBiometricAvailable(available);
      setEnableBiometric(available);
    })();
  }, []);

  const finishSetup = async (skip = false) => {
    if (!skip) {
      await AppLockService.setupLock(pin, biometricAvailable && enableBiometric);
    }

    setOnboarded(true);
    router.replace('/(tabs)/home');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: '#2e3a46' }}>Secure your app</Text>
      <Text style={{ marginTop: 8, color: '#2e3a46' }}>{step === 'pin' ? 'Create a 4–6 digit PIN.' : 'Confirm your PIN.'}</Text>

      <TextInput
        value={step === 'pin' ? pin : confirmPin}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, '').slice(0, 6);
          if (step === 'pin') setPin(digits);
          else setConfirmPin(digits);
        }}
        secureTextEntry
        keyboardType="number-pad"
        style={{ marginTop: 16, borderWidth: 1, borderColor: '#d7dde4', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, fontSize: 18 }}
        placeholder="Enter PIN"
      />

      {step === 'confirm' && biometricAvailable ? (
        <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#2e3a46', fontWeight: '700' }}>Enable biometric?</Text>
            <Text style={{ color: '#2e3a46', marginTop: 4 }}>Use Face ID / Touch ID for faster unlock.</Text>
          </View>
          <Switch value={enableBiometric} onValueChange={setEnableBiometric} />
        </View>
      ) : null}

      {error ? <Text style={{ color: '#ea1100', marginTop: 12 }}>{error}</Text> : null}

      <Pressable
        onPress={async () => {
          if (step === 'pin') {
            if (pin.length < 4) {
              setError('PIN must be at least 4 digits.');
              return;
            }
            setError(null);
            setStep('confirm');
            return;
          }

          if (confirmPin !== pin) {
            setError('PINs do not match. Try again.');
            setConfirmPin('');
            return;
          }

          setError(null);
          await finishSetup(false);
        }}
        style={{ marginTop: 20, backgroundColor: '#0053e2', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>{step === 'pin' ? 'Continue' : 'Save lock settings'}</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          void finishSetup(true);
        }}
        style={{ marginTop: 14, alignItems: 'center' }}
      >
        <Text style={{ color: '#0053e2', fontWeight: '700' }}>Skip for now</Text>
      </Pressable>
    </View>
  );
}
