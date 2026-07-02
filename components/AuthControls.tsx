import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export const KINETIC_COLORS = {
  background: '#0e0e0e',
  surfaceHigh: '#1f1f1f',
  surfaceHighest: '#262626',
  borderDark: '#0e0e0e',
  primary: '#86fea7',
  primaryDeep: '#50c878',
  onSurface: '#ffffff',
  muted: '#ababab',
  outline: '#757575',
};

type PasswordFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  showForgot?: boolean;
  onForgotPress?: () => void;
};

export function PasswordField({
  value,
  onChangeText,
  showForgot = false,
  onForgotPress,
}: PasswordFieldProps) {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>PASSWORD</Text>
        {showForgot ? (
          <Pressable
            onPress={onForgotPress}
            accessibilityRole="button"
            accessibilityLabel="Forgot password">
            <Text style={styles.forgotText}>FORGOT?</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={'\u2022'.repeat(8)}
          placeholderTextColor={KINETIC_COLORS.outline}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={!isPasswordVisible}
          style={styles.input}
        />
        <Pressable
          onPress={() => setPasswordVisible((current) => !current)}
          style={styles.eyeButton}
          accessibilityRole="button"
          accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}>
          <Ionicons
            name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
            size={22}
            color={KINETIC_COLORS.outline}
          />
        </Pressable>
      </View>
    </View>
  );
}

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
};

export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled = false,
  loading = false,
  loadingLabel = 'LOADING...',
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.primaryButton,
        isDisabled && styles.primaryButtonDisabled,
        pressed && !isDisabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}>
      <View style={styles.primaryFill}>
        <View style={styles.primaryHighlight} />
        <View style={styles.primaryShade} />
        <View style={styles.primaryContent}>
          {loading ? <ActivityIndicator size="small" color="#002910" /> : null}
          <Text style={styles.primaryText}>{loading ? loadingLabel : label}</Text>
          {icon && !loading ? <Ionicons name={icon} size={22} color="#002910" /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 8,
  },
  labelRow: {
    minHeight: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: KINETIC_COLORS.muted,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  forgotText: {
    color: KINETIC_COLORS.primaryDeep,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    height: 56,
    paddingHorizontal: 16,
    paddingRight: 52,
    backgroundColor: KINETIC_COLORS.surfaceHighest,
    color: KINETIC_COLORS.onSurface,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0,
  },
  eyeButton: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    height: 64,
    marginTop: 4,
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: KINETIC_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 7,
  },
  primaryFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KINETIC_COLORS.primary,
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '58%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  primaryShade: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '62%',
    height: '100%',
    backgroundColor: 'rgba(0, 97, 47, 0.2)',
  },
  primaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  primaryText: {
    color: '#002910',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
