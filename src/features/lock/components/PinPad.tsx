import { useMemo, useRef, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Animated, Pressable, Text, View } from 'react-native';

interface PinPadProps {
  minLength?: number;
  maxLength?: number;
  biometricAvailable?: boolean;
  biometricType?: 'fingerprint' | 'facial' | 'iris' | null;
  onSubmitPin: (pin: string) => Promise<boolean>;
  onBiometric?: () => void;
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export function PinPad({
  minLength = 4,
  maxLength = 6,
  biometricAvailable = false,
  biometricType,
  onSubmitPin,
  onBiometric,
}: PinPadProps) {
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shake = useRef(new Animated.Value(0)).current;

  const dotCount = Math.max(minLength, Math.min(maxLength, 6));

  const biometricIcon = useMemo(() => {
    if (biometricType === 'facial') return 'scan';
    if (biometricType === 'iris') return 'eye';
    return 'finger-print';
  }, [biometricType]);

  const runShake = () => {
    Animated.sequence([
      Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const submit = async (nextPin: string) => {
    if (nextPin.length < minLength || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const success = await onSubmitPin(nextPin);
    setIsSubmitting(false);

    if (!success) {
      setPin('');
      setError('Wrong PIN. Try again.');
      runShake();
    }
  };

  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      <Animated.View style={{ flexDirection: 'row', gap: 10, marginBottom: 18, transform: [{ translateX: shake }] }}>
        {Array.from({ length: dotCount }).map((_, index) => {
          const filled = index < pin.length;
          return <View key={index} style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: filled ? '#0053e2' : '#d7dde4' }} />;
        })}
      </Animated.View>

      {error ? <Text style={{ color: '#ea1100', marginBottom: 12 }}>{error}</Text> : null}

      <View style={{ width: 280, flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {DIGITS.map((digit, index) => {
          if (digit === '') {
            return (
              <Pressable
                key={`biometric-${index}`}
                onPress={onBiometric}
                disabled={!biometricAvailable || !onBiometric}
                style={{
                  width: 80,
                  height: 62,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: biometricAvailable ? 1 : 0.3,
                }}
              >
                {biometricAvailable ? <Ionicons name={biometricIcon} size={26} color="#0053e2" /> : null}
              </Pressable>
            );
          }

          return (
            <Pressable
              key={digit}
              onPress={() => {
                if (digit === '⌫') {
                  setPin((prev) => prev.slice(0, -1));
                  return;
                }

                setPin((prev) => {
                  if (prev.length >= maxLength) return prev;
                  const next = `${prev}${digit}`;
                  if (next.length === maxLength) {
                    void submit(next);
                  }
                  return next;
                });
              }}
              disabled={isSubmitting}
              style={{
                width: 80,
                height: 62,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#d7dde4',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
              }}
            >
              <Text style={{ fontSize: 24, color: '#2e3a46', fontWeight: '600' }}>{digit}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={{ marginTop: 18 }}>
        <Text style={{ color: '#0053e2', fontWeight: '600' }}>Forgot PIN? Reinstall app to reset lock.</Text>
      </Pressable>
    </View>
  );
}
