import { Ionicons } from '@expo/vector-icons';
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
  type StyleProp,
  type ViewStyle,
  View,
} from 'react-native';

type FieldName = 'fullName' | 'age' | 'gender' | 'country' | 'mobileNumber' | 'password';

type FormState = Record<FieldName, string>;

const initialFormState: FormState = {
  fullName: '',
  age: '',
  gender: '',
  country: '',
  mobileNumber: '',
  password: '',
};

const countryCode = '+1';

export default function RegisterScreen() {
  const [form, setForm] = useState<FormState>(initialFormState);

  const updateField = (field: FieldName, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.header}>
          <Text style={styles.logo}>KINETIC</Text>
          <Pressable style={styles.helpButton} accessibilityRole="button">
            <Ionicons name="help-circle-outline" size={25} color="#484848" />
          </Pressable>
        </View>

        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80',
            }}
            resizeMode="cover"
            style={styles.backgroundImage}
            imageStyle={styles.backgroundImageAsset}>
            <View style={styles.imageOverlay} />
          </ImageBackground>

          <View style={styles.meshTop} />
          <View style={styles.meshBottom} />

          <View style={styles.content}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>ENTER YOUR{'\n'}DETAILS</Text>
              <View style={styles.accentLine} />
            </View>

            <View style={styles.form}>
              <InputField
                label="FULL NAME"
                placeholder="Your Name"
                value={form.fullName}
                onChangeText={(value) => updateField('fullName', value)}
                autoCapitalize="words"
              />

              <View style={styles.twoColumnRow}>
                <InputField
                  label="AGE"
                  placeholder="28"
                  value={form.age}
                  onChangeText={(value) => updateField('age', value)}
                  keyboardType="number-pad"
                  containerStyle={styles.flexField}
                />
                <InputField
                  label="GENDER"
                  placeholder="SELECT"
                  value={form.gender}
                  onChangeText={(value) => updateField('gender', value)}
                  autoCapitalize="characters"
                  containerStyle={styles.flexField}
                  rightIcon="chevron-down"
                />
              </View>

              <InputField
                label="COUNTRY"
                placeholder="UNITED STATES (+1)"
                value={form.country}
                onChangeText={(value) => updateField('country', value)}
                autoCapitalize="characters"
                rightIcon="chevron-down"
              />

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>MOBILE NUMBER</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.countryCodeBox}>
                    <Text style={styles.countryCodeText}>{countryCode}</Text>
                  </View>
                  <TextInput
                    value={form.mobileNumber}
                    onChangeText={(value) => updateField('mobileNumber', value)}
                    placeholder="000 000 0000"
                    placeholderTextColor="#757575"
                    keyboardType="phone-pad"
                    style={[styles.input, styles.phoneInput]}
                  />
                </View>
              </View>

              <InputField
                label="PASSWORD"
                placeholder="••••••••"
                value={form.password}
                onChangeText={(value) => updateField('password', value)}
                secureTextEntry
                rightIcon="eye-off-outline"
              />

              <Pressable style={({ pressed }) => [styles.registerButton, pressed && styles.pressed]}>
                <View style={styles.registerFill}>
                  <View style={styles.registerHighlight} />
                  <View style={styles.registerShade} />
                  <Text style={styles.registerText}>REGISTER</Text>
                </View>
              </Pressable>

              <View style={styles.loginRow}>
                <Text style={styles.memberText}>ALREADY A MEMBER?</Text>
                <Text style={styles.loginText}>LOGIN HERE</Text>
              </View>
            </View>

            <View style={styles.footerLines}>
              <View style={[styles.footerLine, styles.footerLineLong]} />
              <View style={[styles.footerLine, styles.footerLineMedium]} />
              <View style={[styles.footerLine, styles.footerLineShort]} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type InputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  containerStyle?: StyleProp<ViewStyle>;
  keyboardType?: 'default' | 'number-pad' | 'phone-pad';
  rightIcon?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
};

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  autoCapitalize = 'none',
  containerStyle,
  keyboardType = 'default',
  rightIcon,
  secureTextEntry = false,
}: InputFieldProps) {
  return (
    <View style={[styles.fieldGroup, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#757575"
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          style={[styles.input, rightIcon ? styles.inputWithIcon : null]}
        />
        {rightIcon ? (
          <Ionicons name={rightIcon} size={22} color={rightIcon === 'eye-off-outline' ? '#757575' : '#86fea7'} style={styles.inputIcon} />
        ) : null}
      </View>
    </View>
  );
}

const colors = {
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    height: 64,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  logo: {
    color: colors.primaryDeep,
    fontSize: 25,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 0,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(80, 200, 120, 0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  helpButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: 820,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },
  backgroundImageAsset: {
    opacity: 0.75,
  },
  imageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 14, 14, 0.76)',
  },
  meshTop: {
    position: 'absolute',
    top: 0,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(80, 200, 120, 0.06)',
  },
  meshBottom: {
    position: 'absolute',
    right: -110,
    bottom: -70,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(0, 220, 254, 0.035)',
  },
  content: {
    width: '100%',
    maxWidth: 560,
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  titleBlock: {
    marginBottom: 38,
  },
  title: {
    color: colors.onSurface,
    fontSize: 48,
    lineHeight: 49,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 0,
  },
  accentLine: {
    width: 96,
    height: 4,
    marginTop: 17,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 4,
  },
  form: {
    gap: 20,
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
  inputWrap: {
    position: 'relative',
  },
  input: {
    height: 56,
    backgroundColor: colors.surfaceHighest,
    color: colors.onSurface,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0,
    borderBottomWidth: 0,
    borderBottomColor: colors.primary,
  },
  inputWithIcon: {
    paddingRight: 48,
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: 17,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 16,
  },
  flexField: {
    flex: 1,
  },
  phoneRow: {
    flexDirection: 'row',
  },
  countryCodeBox: {
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceHigh,
    borderRightWidth: 1,
    borderRightColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  phoneInput: {
    flex: 1,
  },
  registerButton: {
    height: 64,
    marginTop: 4,
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 7,
  },
  registerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  registerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '58%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  registerShade: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '62%',
    height: '100%',
    backgroundColor: 'rgba(0, 97, 47, 0.2)',
  },
  registerText: {
    color: '#002910',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  loginRow: {
    paddingTop: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 4,
  },
  memberText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  loginText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  footerLines: {
    marginTop: 48,
    flexDirection: 'row',
    gap: 16,
    opacity: 0.1,
  },
  footerLine: {
    height: 1,
    backgroundColor: colors.onSurface,
  },
  footerLineLong: {
    flex: 1,
  },
  footerLineMedium: {
    width: 16,
  },
  footerLineShort: {
    width: 8,
  },
});
