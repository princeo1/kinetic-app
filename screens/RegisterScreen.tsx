import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
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
import worldCountries, { type Country } from 'world-countries';

type FieldName = 'fullName' | 'age' | 'gender' | 'country' | 'mobileNumber' | 'password';

type FormState = Record<FieldName, string>;

type SelectionOption = {
  key: string;
  label: string;
  detail?: string;
};

type CountryOption = SelectionOption & {
  callingCode: string;
};

const genderOptions: SelectionOption[] = [
  { key: 'Male', label: 'Male' },
  { key: 'Female', label: 'Female' },
  { key: 'Other', label: 'Other' },
];

const getCallingCode = (country: Country) => {
  const { root, suffixes } = country.idd;

  if (!root) {
    return '';
  }

  if (root === '+1' || root === '+7') {
    return root;
  }

  return `${root}${suffixes[0] ?? ''}`;
};

const countryOptions: CountryOption[] = worldCountries
  .map((country) => {
    const callingCode = getCallingCode(country);

    return {
      key: country.cca2,
      label: country.name.common,
      detail: callingCode,
      callingCode,
    };
  })
  .sort((first, second) => first.label.localeCompare(second.label));

const initialFormState: FormState = {
  fullName: '',
  age: '',
  gender: '',
  country: 'UNITED STATES',
  mobileNumber: '',
  password: '',
};

const initialCallingCode = '+1';

export default function RegisterScreen() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [selectedCountryCode, setSelectedCountryCode] = useState('US');
  const [callingCode, setCallingCode] = useState(initialCallingCode);
  const [isGenderPickerVisible, setGenderPickerVisible] = useState(false);
  const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const updateField = (field: FieldName, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCountrySelect = (country: CountryOption) => {
    setSelectedCountryCode(country.key);
    setCallingCode(country.callingCode);
    updateField('country', country.label.toUpperCase());
    setCountryPickerVisible(false);
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
                <View style={[styles.fieldGroup, styles.flexField]}>
                  <Text style={styles.label}>GENDER</Text>
                  <Pressable
                    onPress={() => setGenderPickerVisible(true)}
                    style={styles.selectionField}
                    accessibilityRole="button"
                    accessibilityLabel="Select gender">
                    <Text style={[styles.selectionFieldText, !form.gender && styles.placeholderText]}>
                      {form.gender || 'SELECT'}
                    </Text>
                    <Ionicons name="chevron-down" size={22} color={colors.primary} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>COUNTRY</Text>
                <Pressable
                  onPress={() => setCountryPickerVisible(true)}
                  style={styles.inputWrap}
                  accessibilityRole="button"
                  accessibilityLabel="Select country">
                  <Text style={[styles.input, styles.countryPickerText, styles.inputWithIcon]}>
                    {form.country} ({callingCode})
                  </Text>
                  <Ionicons name="chevron-down" size={22} color={colors.primary} style={styles.inputIcon} />
                </Pressable>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>MOBILE NUMBER</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.countryCodeBox}>
                    <Text style={styles.countryCodeText}>{callingCode}</Text>
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
                secureTextEntry={!isPasswordVisible}
                rightIcon={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                onRightIconPress={() => setPasswordVisible((current) => !current)}
                rightIconAccessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
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

        <SelectionModal
          visible={isGenderPickerVisible}
          title="SELECT GENDER"
          options={genderOptions}
          selectedKey={form.gender}
          onClose={() => setGenderPickerVisible(false)}
          onSelect={(option) => {
            updateField('gender', option.key);
            setGenderPickerVisible(false);
          }}
        />

        <SelectionModal
          visible={isCountryPickerVisible}
          title="SELECT COUNTRY"
          options={countryOptions}
          selectedKey={selectedCountryCode}
          searchable
          searchPlaceholder="Search country"
          onClose={() => setCountryPickerVisible(false)}
          onSelect={(option) => handleCountrySelect(option as CountryOption)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type SelectionModalProps = {
  visible: boolean;
  title: string;
  options: SelectionOption[];
  selectedKey: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSelect: (option: SelectionOption) => void;
  onClose: () => void;
};

function SelectionModal({
  visible,
  title,
  options,
  selectedKey,
  searchable = false,
  searchPlaceholder = 'Search',
  onSelect,
  onClose,
}: SelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredOptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter(
      (option) =>
        option.label.toLocaleLowerCase().includes(normalizedQuery) ||
        option.detail?.toLocaleLowerCase().includes(normalizedQuery)
    );
  }, [options, searchQuery]);

  const closeModal = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={closeModal}>
      <View style={styles.modalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeModal}
          accessibilityRole="button"
          accessibilityLabel={`Close ${title.toLocaleLowerCase()}`}
        />

        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable
              onPress={closeModal}
              style={styles.modalCloseButton}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={colors.onSurface} />
            </Pressable>
          </View>

          {searchable ? (
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={20} color={colors.outline} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor={colors.outline}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.searchInput}
              />
            </View>
          ) : null}

          <FlatList
            data={filteredOptions}
            keyExtractor={(option) => option.key}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.optionsList}
            ListEmptyComponent={<Text style={styles.emptyText}>NO COUNTRY FOUND</Text>}
            renderItem={({ item }) => {
              const isSelected = item.key === selectedKey;

              return (
                <Pressable
                  onPress={() => onSelect(item)}
                  style={({ pressed }) => [
                    styles.optionRow,
                    isSelected && styles.selectedOptionRow,
                    pressed && styles.optionRowPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}>
                  <Text style={styles.optionLabel}>{item.label}</Text>
                  <View style={styles.optionTrailing}>
                    {item.detail ? <Text style={styles.optionDetail}>{item.detail}</Text> : null}
                    {isSelected ? <Ionicons name="checkmark" size={21} color={colors.primary} /> : null}
                  </View>
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
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
  onRightIconPress?: () => void;
  rightIconAccessibilityLabel?: string;
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
  onRightIconPress,
  rightIconAccessibilityLabel,
}: InputFieldProps) {
  const icon = rightIcon ? (
    <Ionicons
      name={rightIcon}
      size={22}
      color={rightIcon.includes('eye') ? '#757575' : '#86fea7'}
    />
  ) : null;

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
        {rightIcon && onRightIconPress ? (
          <Pressable
            onPress={onRightIconPress}
            style={styles.inputIconButton}
            accessibilityRole="button"
            accessibilityLabel={rightIconAccessibilityLabel}>
            {icon}
          </Pressable>
        ) : null}
        {rightIcon && !onRightIconPress ? <View style={styles.inputIcon}>{icon}</View> : null}
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
  inputIconButton: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionField: {
    height: 56,
    backgroundColor: colors.surfaceHighest,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectionFieldText: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '700',
  },
  placeholderText: {
    color: colors.outline,
  },
  countryPickerText: {
    lineHeight: 56,
    textTransform: 'uppercase',
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
  modalOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
  },
  modalSheet: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '72%',
    minHeight: 220,
    backgroundColor: colors.background,
    borderTopWidth: 3,
    borderTopColor: colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  modalHeader: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    height: 52,
    marginBottom: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceHighest,
  },
  searchInput: {
    flex: 1,
    height: 52,
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '700',
  },
  optionsList: {
    paddingBottom: 8,
  },
  optionRow: {
    minHeight: 54,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3a3a3a',
  },
  selectedOptionRow: {
    backgroundColor: 'rgba(134, 254, 167, 0.08)',
  },
  optionRowPressed: {
    backgroundColor: colors.surfaceHigh,
  },
  optionLabel: {
    flex: 1,
    paddingRight: 12,
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '700',
  },
  optionTrailing: {
    minWidth: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  optionDetail: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  emptyText: {
    paddingVertical: 40,
    color: colors.muted,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
});
