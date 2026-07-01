import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  KINETIC_COLORS as colors,
  PasswordField,
  PrimaryButton,
} from '@/components/AuthControls';

const athleteImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCFN0N6S6K8fNRnKy5Bo_x3iZ0NfGAW1lS2A5wxqZGImywgRb_Gwy3dHjZZdz8rKs5dGYneJbQicq8z-3BW4yfFrZZrlPPkqz6LZCH54JawPCFHqyZNmTXDyE0CWASld68nGms4KqGa473YLlUZpydIB1G4KvY4KZxRHUkrhQtTwVGHsO5YJPslkEyH0Ky5fu1EbWIy9cxSUk_kstJb0gYsmOHk9UZYe6Z7jpR9dwbxTuI7bYB_22YssVvaBTcynfqFW8hgsA387Fo';

export default function LoginScreen() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={{ uri: athleteImage }}
        resizeMode="cover"
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageAsset}>
        <View style={styles.backgroundOverlay} />
      </ImageBackground>

      <View style={styles.meshTop} />
      <View style={styles.meshBottom} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Ionicons name="flash" size={27} color={colors.primary} />
            <Text style={styles.logo}>KINETIC</Text>
          </View>
        </View>

        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.hero}>
              <Text style={styles.rawPower} accessibilityElementsHidden>
                RAW POWER
              </Text>
              <Text style={styles.title}>
                IGNITE YOUR <Text style={styles.titleAccent}>DREAM.</Text>
              </Text>
              <Text style={styles.description}>
                Access your high-performance biometric HUD and training protocols.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>MOBILE NUMBER</Text>
                <TextInput
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor={colors.outline}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  style={styles.input}
                />
              </View>

              <PasswordField
                value={password}
                onChangeText={setPassword}
                showForgot
              />

              <View style={styles.actions}>
                <PrimaryButton
                  label="LOGIN"
                  icon="arrow-forward"
                  onPress={() => router.push('/dashboard')}
                />

                <View style={styles.registerRow}>
                  <Text style={styles.newHereText}>NEW HERE?</Text>
                  <Pressable
                    onPress={() => router.replace('/')}
                    accessibilityRole="button"
                    accessibilityLabel="Open register screen">
                    <Text style={styles.registerText}>REGISTER</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImageAsset: {
    opacity: 0.2,
  },
  backgroundOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 14, 14, 0.78)',
  },
  meshTop: {
    position: 'absolute',
    top: -120,
    left: -130,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(134, 254, 167, 0.035)',
  },
  meshBottom: {
    position: 'absolute',
    right: -140,
    bottom: -120,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(59, 182, 104, 0.035)',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    height: 88,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  logo: {
    color: colors.primary,
    fontSize: 27,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 0,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: 710,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  content: {
    width: '100%',
    maxWidth: 448,
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  hero: {
    position: 'relative',
    marginBottom: 46,
  },
  rawPower: {
    position: 'absolute',
    top: -48,
    left: -22,
    color: colors.surfaceHigh,
    fontSize: 80,
    lineHeight: 88,
    fontWeight: '900',
    opacity: 0.18,
  },
  title: {
    color: colors.onSurface,
    fontSize: 48,
    lineHeight: 50,
    fontWeight: '900',
    letterSpacing: 0,
  },
  titleAccent: {
    color: colors.primary,
  },
  description: {
    maxWidth: 360,
    marginTop: 16,
    color: colors.muted,
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '300',
    letterSpacing: 0,
  },
  form: {
    gap: 28,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  input: {
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: colors.surfaceHighest,
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0,
  },
  actions: {
    paddingTop: 4,
    gap: 24,
  },
  registerRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  newHereText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  registerText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});
