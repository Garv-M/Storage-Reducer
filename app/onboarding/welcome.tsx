import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/ui/primitives/Button';
import { Card } from '@/ui/primitives/Card';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';

// ── Feature highlight data ────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: 'swap-horizontal' as const,
    title: 'Swipe to Decide',
    desc: 'Left to delete, right to keep',
  },
  {
    icon: 'shield-checkmark' as const,
    title: 'Safe Deletion',
    desc: 'Nothing deleted without your review',
  },
  {
    icon: 'stats-chart' as const,
    title: 'Track Progress',
    desc: "See how much storage you've reclaimed",
  },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────
export default function WelcomeScreen() {
  const router = useRouter();

  // Staggered entrance animations — one per card + hero section
  const heroAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(FEATURES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const heroEntrance = Animated.timing(heroAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    });

    const cardEntrances = cardAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: 350 + i * 50,
        useNativeDriver: true,
      })
    );

    Animated.parallel([heroEntrance, ...cardEntrances]).start();
  }, [cardAnims, heroAnim]);

  const heroStyle = {
    opacity: heroAnim,
    transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <Animated.View style={[styles.hero, heroStyle]}>
          <View style={styles.iconWrap}>
            <Ionicons name="sparkles" size={80} color={colors.spark100} />
          </View>
          <Text variant="hero" color={colors.blue100} style={styles.appName}>
            SwipeClean
          </Text>
          <Text variant="body" color={colors.light.textSecondary} style={styles.tagline}>
            Swipe your photos. Free your storage.
          </Text>
        </Animated.View>

        {/* ── Feature cards ── */}
        <View style={styles.cards}>
          {FEATURES.map((feat, i) => {
            const animStyle = {
              opacity: cardAnims[i],
              transform: [
                {
                  translateY: cardAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            };

            return (
              <Animated.View key={feat.title} style={animStyle}>
                <Card variant="outlined" padding={16} style={styles.featureCard}>
                  <View style={styles.featureRow}>
                    <View style={styles.featureIconWrap}>
                      <Ionicons name={feat.icon} size={24} color={colors.blue100} />
                    </View>
                    <View style={styles.featureText}>
                      <Text variant="heading" color={colors.gray180}>
                        {feat.title}
                      </Text>
                      <Text variant="caption" color={colors.light.textSecondary}>
                        {feat.desc}
                      </Text>
                    </View>
                  </View>
                </Card>
              </Animated.View>
            );
          })}
        </View>

        {/* ── CTA ── */}
        <View style={styles.cta}>
          <Button
            label="Get Started"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.push('/onboarding/permissions')}
            accessibilityLabel="Get Started — navigate to permissions"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 24,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconWrap: {
    marginBottom: 16,
  },
  appName: {
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    textAlign: 'center',
    maxWidth: 280,
  },
  cards: {
    gap: 12,
    marginBottom: 48,
  },
  featureCard: {
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  cta: {
    paddingBottom: 24,
  },
});
