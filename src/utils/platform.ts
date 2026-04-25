import { Dimensions, Platform } from 'react-native';

const windowDimensions = Dimensions.get('window');

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const screenWidth = windowDimensions.width;
export const screenHeight = windowDimensions.height;
