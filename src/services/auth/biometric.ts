import * as LocalAuthentication from 'expo-local-authentication';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | null;

export const isBiometricAvailable = async () => {
  const [hasHardware, enrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);

  return hasHardware && enrolled;
};

export const getBiometricType = async (): Promise<BiometricType> => {
  const available = await isBiometricAvailable();
  if (!available) return null;

  const supported = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (supported.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'facial';
  if (supported.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'fingerprint';
  if (supported.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'iris';

  return null;
};

export const authenticateWithBiometric = async (promptMessage = 'Authenticate to continue') => {
  return LocalAuthentication.authenticateAsync({
    promptMessage,
    fallbackLabel: 'Use PIN',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });
};
