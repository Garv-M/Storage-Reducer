import { Component, type ReactNode } from 'react';

import { Pressable, Text, View } from 'react-native';

interface ScreenErrorBoundaryProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
}

interface ScreenErrorBoundaryState {
  hasError: boolean;
}

export class ScreenErrorBoundary extends Component<ScreenErrorBoundaryProps, ScreenErrorBoundaryState> {
  state: ScreenErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Screen crashed', error);
  }

  private onRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 30 }}>⚠️</Text>
          <Text style={{ marginTop: 8, color: '#1b242d', fontSize: 22, fontWeight: '700' }}>
            {this.props.title ?? 'Something went wrong'}
          </Text>
          <Text style={{ marginTop: 8, color: '#2e3a46', textAlign: 'center' }}>
            {this.props.subtitle ?? 'Please try again. Your data is still safe.'}
          </Text>
          <Pressable
            onPress={this.onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry"
            style={{ marginTop: 14, borderRadius: 10, backgroundColor: '#0053e2', paddingHorizontal: 16, paddingVertical: 10 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
