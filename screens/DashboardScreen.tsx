import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
  useWindowDimensions,
  View,
} from 'react-native';

import {
  KINETIC_COLORS as colors,
  PrimaryButton,
} from '@/components/AuthControls';
import {
  annualLoadData,
  annualWorkoutCount,
  dashboardStats,
  dashboardTabs,
  type HeatmapDay,
  lastSession,
  muscleProgressData,
  workoutMuscleOptions,
} from '@/constants/dashboard-data';
import { supabase } from '@/lib/supabase';
import { saveWorkoutForDate } from '@/lib/workouts';

const profileImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCdRB9NmiIbya5IDJOC1c4tWu-kH0cebkyqMhEXa7HfoMHEa0jQjrnnoiX2sb01I76qncdLj7LXMOzWt2vNgvhG_ySLXzl4gKoLvp3Db0mFYCHio6PsIggKDkA2Zy0OO7nPq0H4tKJdVcEs4tvnlfnjZE3Y4o8wGVHv8TGGDMzzgV0j8PUjhBHQxStR7Y7ocswKf9cHKSY73Vd7Bj_3303xN6fsubp_Q6lPsfx4mtPsPHQ8QS4uR7_R10EUKbHy_vATPyeD7dQvamw';

const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const heatColors = [
  colors.surfaceHighest,
  'rgba(134, 254, 167, 0.2)',
  'rgba(134, 254, 167, 0.45)',
  'rgba(134, 254, 167, 0.7)',
  colors.primary,
];
const profileMenuItems = [
  {
    key: 'logout',
    label: 'LOGOUT',
    icon: 'log-out-outline',
  },
] as const;

type HeatmapCell = HeatmapDay | null;

function buildHeatmapWeeks(days: HeatmapDay[]) {
  if (days.length === 0) {
    return [];
  }

  const firstDay = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const mondayOffset = (firstDay + 6) % 7;
  const cells: HeatmapCell[] = [
    ...Array.from<HeatmapCell>({ length: mondayOffset }).fill(null),
    ...days,
  ];

  return Array.from({ length: Math.ceil(cells.length / 7) }, (_, weekIndex) =>
    cells.slice(weekIndex * 7, weekIndex * 7 + 7)
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [isWorkoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [isProfileMenuVisible, setProfileMenuVisible] = useState(false);
  const [isSigningOut, setSigningOut] = useState(false);
  const isWideLayout = width >= 800;
  const contentWidth = Math.min(width, 1024) - 48;
  const statCardWidth = isWideLayout
    ? (contentWidth - 36) / 4
    : (contentWidth - 12) / 2;

  const handleLogout = async () => {
    setSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setProfileMenuVisible(false);
      router.replace('/login');
    } catch {
      Alert.alert('Unable to Log Out', 'Please check your connection and try again.');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.meshTop} />
      <View style={styles.meshBottom} />

      <DashboardHeader onProfilePress={() => setProfileMenuVisible(true)} />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>STAY{'\n'}CONSISTENT</Text>
            <View style={styles.heroLine} />
            <Text style={styles.heroCopy}>
              ELITE PERFORMANCE IS BUILT ON REPETITION. DON&apos;T BREAK THE CHAIN.
            </Text>
          </View>

          <View style={styles.statsGrid}>
            {dashboardStats.map((stat) => (
              <View
                key={stat.label}
                style={[
                  styles.statCard,
                  { width: statCardWidth },
                  stat.highlighted && styles.highlightedStatCard,
                ]}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={[styles.statValue, stat.highlighted && styles.highlightedStatValue]}>
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>

          <AnnualEngineLoad />

          <View style={[styles.detailColumns, isWideLayout && styles.detailColumnsWide]}>
            <View style={styles.detailColumn}>
              <MusclesTrained />
            </View>

            <View style={styles.detailColumn}>
              <PrimaryButton
                label="RECORD WORKOUT"
                icon="add-circle-outline"
                onPress={() => setWorkoutModalVisible(true)}
              />
              <LastSession />
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomNavigation />

      <RecordWorkoutModal
        visible={isWorkoutModalVisible}
        onClose={() => setWorkoutModalVisible(false)}
      />

      <ProfileMenu
        visible={isProfileMenuVisible}
        isSigningOut={isSigningOut}
        onClose={() => setProfileMenuVisible(false)}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
}

type DashboardHeaderProps = {
  onProfilePress: () => void;
};

function DashboardHeader({ onProfilePress }: DashboardHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerBrand}>
        <Pressable
          style={styles.headerIconButton}
          accessibilityRole="button"
          accessibilityLabel="Open menu">
          <Ionicons name="menu" size={25} color={colors.primary} />
        </Pressable>
        <Text style={styles.logo}>KINETIC</Text>
      </View>

      <Pressable
        onPress={onProfilePress}
        style={styles.avatarFrame}
        accessibilityRole="button"
        accessibilityLabel="Open profile menu">
        <Image source={{ uri: profileImage }} style={styles.avatar} />
      </Pressable>
    </View>
  );
}

type ProfileMenuProps = {
  visible: boolean;
  isSigningOut: boolean;
  onClose: () => void;
  onLogout: () => void;
};

function ProfileMenu({
  visible,
  isSigningOut,
  onClose,
  onLogout,
}: ProfileMenuProps) {
  const actions = {
    logout: onLogout,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.profileMenuOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close profile menu"
        />

        <View style={styles.profileMenu}>
          {profileMenuItems.map((item) => (
            <Pressable
              key={item.key}
              onPress={actions[item.key]}
              disabled={isSigningOut}
              style={({ pressed }) => [
                styles.profileMenuItem,
                pressed && styles.profileMenuItemPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}>
              {isSigningOut ? (
                <ActivityIndicator size="small" color="#ff716c" />
              ) : (
                <Ionicons name={item.icon} size={20} color="#ff716c" />
              )}
              <Text style={styles.profileMenuItemText}>
                {isSigningOut ? 'SIGNING OUT...' : item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

function AnnualEngineLoad() {
  const { width } = useWindowDimensions();
  const weeks = useMemo(() => buildHeatmapWeeks(annualLoadData), []);
  const cellSize = width < 420 ? 9 : 11;

  return (
    <View style={styles.heatmapSection}>
      <View style={styles.heatmapHeader}>
        <View style={styles.heatmapHeading}>
          <Text style={styles.sectionEyebrow}>ANNUAL ENGINE LOAD</Text>
          <Text style={styles.heatmapSubheading}>
            {annualWorkoutCount} WORKOUTS RECORDED THIS YEAR
          </Text>
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendLabel}>LOAD</Text>
          {heatColors.map((color) => (
            <View key={color} style={[styles.legendCell, { backgroundColor: color }]} />
          ))}
        </View>
      </View>

      <View style={styles.heatmapBody}>
        <View style={[styles.dayLabels, { gap: 3 }]}>
          {dayLabels.map((day) => (
            <Text key={day} style={[styles.dayLabel, { height: cellSize }]}>
              {day}
            </Text>
          ))}
        </View>

        {weeks.length > 0 ? (
          <ScrollView
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.heatmapScrollContent}>
            {weeks.map((week, weekIndex) => (
              <View key={`week-${weekIndex}`} style={styles.heatmapWeek}>
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const day = week[dayIndex] ?? null;

                  return (
                    <View
                      key={day?.date ?? `empty-${weekIndex}-${dayIndex}`}
                      accessibilityLabel={
                        day ? `${day.date}, load level ${day.intensity}` : 'No date'
                      }
                      style={[
                        styles.heatmapCell,
                        {
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: day
                            ? heatColors[day.intensity]
                            : 'transparent',
                        },
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.heatmapEmptyState}>
            <Text style={styles.emptyStateText}>NO WORKOUT DATA YET</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function MusclesTrained() {
  return (
    <View>
      <View style={styles.sectionTitleBlock}>
        <Text style={styles.sectionTitle}>MUSCLES TRAINED</Text>
        <View style={styles.sectionLine} />
      </View>

      <View style={styles.muscleList}>
        {muscleProgressData.map((muscle) => (
          <View key={muscle.name} style={styles.muscleItem}>
            <View style={styles.muscleHeader}>
              <Text style={styles.muscleName}>{muscle.name}</Text>
              <Text style={styles.muscleSessions}>{muscle.sessions} SESSIONS</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(muscle.progress * 100)}%` },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function LastSession() {
  return (
    <ImageBackground
      source={{ uri: lastSession.image }}
      resizeMode="cover"
      style={styles.lastSession}
      imageStyle={styles.lastSessionImage}>
      <View style={styles.lastSessionOverlay} />
      <View style={styles.lastSessionContent}>
        <Text style={styles.lastSessionEyebrow}>{lastSession.eyebrow}</Text>
        <Text style={styles.lastSessionTitle}>{lastSession.title}</Text>
        <Text style={styles.lastSessionDetails}>{lastSession.details}</Text>
      </View>
    </ImageBackground>
  );
}

type RecordWorkoutModalProps = {
  visible: boolean;
  onClose: () => void;
};

function RecordWorkoutModal({ visible, onClose }: RecordWorkoutModalProps) {
  const [attendance, setAttendance] = useState<'Present' | 'Absent'>('Present');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([
    workoutMuscleOptions[0],
  ]);
  const [weightKg, setWeightKg] = useState('');
  const [waistInches, setWaistInches] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [cardioMinutes, setCardioMinutes] = useState(0);
  const [yogaMinutes, setYogaMinutes] = useState(0);
  const [isSaving, setSaving] = useState(false);

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles((current) =>
      current.includes(muscle)
        ? current.filter((item) => item !== muscle)
        : [...current, muscle]
    );
  };

  const handleSave = async () => {
    const parsedWeight = Number(weightKg);
    const parsedWaist = Number(waistInches);
    const parsedDuration = Number(durationMinutes);

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      Alert.alert('Check Weight', "Enter today's weight in kg.");
      return;
    }

    if (!Number.isFinite(parsedWaist) || parsedWaist <= 0) {
      Alert.alert('Check Waist', "Enter today's waist measurement in inches.");
      return;
    }

    if (!Number.isInteger(parsedDuration) || parsedDuration < 0) {
      Alert.alert('Check Duration', 'Enter workout duration in whole minutes.');
      return;
    }

    if (selectedMuscles.length === 0 && attendance === 'Present') {
      Alert.alert('Choose Muscle', 'Select at least one muscle trained.');
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw userError ?? new Error('No active user session.');
      }

      await saveWorkoutForDate({
        userId: user.id,
        workoutDate: getLocalDateKey(),
        attendance: attendance === 'Present',
        weightKg: parsedWeight,
        waistInches: parsedWaist,
        durationMinutes: parsedDuration,
        musclesTrained: attendance === 'Present' ? selectedMuscles : [],
        cardioMinutes,
        yogaMinutes,
      });

      onClose();
    } catch {
      Alert.alert('Workout Not Saved', 'Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close workout modal"
        />

        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalEyebrow}>TRAINING LOG</Text>
              <Text style={styles.modalTitle}>RECORD WORKOUT</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={styles.modalCloseButton}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <Ionicons name="close" size={25} color={colors.onSurface} />
            </Pressable>
          </View>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContent}>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>GYM ATTENDANCE</Text>
              <View style={styles.segmentedControl}>
                {(['Present', 'Absent'] as const).map((option) => {
                  const isSelected = attendance === option;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => setAttendance(option)}
                      style={[
                        styles.segmentButton,
                        isSelected && styles.segmentButtonSelected,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}>
                      <Text
                        style={[
                          styles.segmentText,
                          isSelected && styles.segmentTextSelected,
                        ]}>
                        {option.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <MetricInput
              label="TODAY'S WEIGHT (KG)"
              value={weightKg}
              onChangeText={setWeightKg}
              placeholder="0"
              keyboardType="decimal-pad"
            />

            <MetricInput
              label="TODAY'S WAIST (INCHES)"
              value={waistInches}
              onChangeText={setWaistInches}
              placeholder="0"
              keyboardType="decimal-pad"
            />

            <MetricInput
              label="WORKOUT DURATION (MINUTES)"
              value={durationMinutes}
              onChangeText={setDurationMinutes}
              placeholder="0"
              keyboardType="number-pad"
            />

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>MUSCLE TRAINED</Text>
              <View style={styles.muscleOptions}>
                {workoutMuscleOptions.map((muscle) => {
                  const isSelected = selectedMuscles.includes(muscle);

                  return (
                    <Pressable
                      key={muscle}
                      onPress={() => toggleMuscle(muscle)}
                      style={[
                        styles.muscleOption,
                        isSelected && styles.muscleOptionSelected,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}>
                      <Text
                        style={[
                          styles.muscleOptionText,
                          isSelected && styles.muscleOptionTextSelected,
                        ]}>
                        {muscle.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <NumberStepper
              label="CARDIO MINUTES"
              value={cardioMinutes}
              onChange={setCardioMinutes}
            />
            <NumberStepper
              label="YOGA MINUTES"
              value={yogaMinutes}
              onChange={setYogaMinutes}
            />

            <PrimaryButton
              label="DONE"
              onPress={handleSave}
              loading={isSaving}
              loadingLabel="SAVING..."
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type MetricInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType: 'decimal-pad' | 'number-pad';
};

function MetricInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: MetricInputProps) {
  return (
    <View style={styles.modalField}>
      <Text style={styles.modalLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        keyboardType={keyboardType}
        style={styles.modalInput}
      />
    </View>
  );
}

type NumberStepperProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function NumberStepper({ label, value, onChange }: NumberStepperProps) {
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.modalLabel}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          onPress={() => onChange(Math.max(0, value - 1))}
          style={styles.stepperButton}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label.toLocaleLowerCase()}`}>
          <Ionicons name="remove" size={20} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.stepperValue}>{value}</Text>
        <Pressable
          onPress={() => onChange(value + 1)}
          style={styles.stepperButton}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label.toLocaleLowerCase()}`}>
          <Ionicons name="add" size={20} color={colors.onSurface} />
        </Pressable>
      </View>
    </View>
  );
}

function getLocalDateKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function BottomNavigation() {
  return (
    <View style={styles.bottomNavigation}>
      {dashboardTabs.map((tab, index) => {
        const isActive = index === 0;

        return (
          <Pressable
            key={tab.label}
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}>
            <Ionicons
              name={tab.icon}
              size={23}
              color={isActive ? colors.primary : '#555555'}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {tab.label}
            </Text>
            {isActive ? <View style={styles.activeNavIndicator} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  meshTop: {
    position: 'absolute',
    top: -140,
    left: -140,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(80, 200, 120, 0.045)',
  },
  meshBottom: {
    position: 'absolute',
    right: -150,
    bottom: 40,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(0, 220, 254, 0.025)',
  },
  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#252525',
    zIndex: 2,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 36,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  logo: {
    color: colors.primaryDeep,
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 0,
  },
  avatarFrame: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(134, 254, 167, 0.35)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  profileMenu: {
    position: 'absolute',
    top: 70,
    right: 16,
    width: 184,
    padding: 6,
    backgroundColor: colors.surfaceHigh,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#3a3a3a',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 12,
  },
  profileMenuItem: {
    minHeight: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileMenuItemPressed: {
    backgroundColor: colors.surfaceHighest,
  },
  profileMenuItemText: {
    color: '#ff716c',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 42,
    paddingBottom: 50,
  },
  content: {
    width: '100%',
    maxWidth: 1024,
    alignSelf: 'center',
    gap: 42,
  },
  hero: {
    alignItems: 'flex-start',
  },
  heroTitle: {
    color: colors.onSurface,
    fontSize: 48,
    lineHeight: 44,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 0,
  },
  heroLine: {
    width: 96,
    height: 4,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 10,
    elevation: 4,
  },
  heroCopy: {
    maxWidth: 470,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    minHeight: 112,
    padding: 20,
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceHigh,
  },
  highlightedStatCard: {
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
  statLabel: {
    minHeight: 24,
    color: colors.muted,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  statValue: {
    color: colors.onSurface,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '900',
  },
  highlightedStatValue: {
    color: colors.primary,
  },
  heatmapSection: {
    padding: 20,
    backgroundColor: '#131313',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#292929',
  },
  heatmapHeader: {
    marginBottom: 24,
    gap: 14,
  },
  heatmapHeading: {
    gap: 5,
  },
  sectionEyebrow: {
    color: colors.onSurface,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  heatmapSubheading: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendLabel: {
    marginRight: 3,
    color: colors.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 1,
  },
  heatmapBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dayLabels: {
    paddingRight: 8,
  },
  dayLabel: {
    width: 25,
    color: colors.onSurface,
    fontSize: 7,
    lineHeight: 9,
    fontWeight: '800',
    textAlignVertical: 'center',
  },
  heatmapScrollContent: {
    flexDirection: 'row',
    gap: 3,
    paddingRight: 4,
  },
  heatmapEmptyState: {
    minHeight: 88,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHighest,
  },
  emptyStateText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  heatmapWeek: {
    gap: 3,
  },
  heatmapCell: {
    borderRadius: 1,
  },
  detailColumns: {
    gap: 38,
  },
  detailColumnsWide: {
    flexDirection: 'row',
  },
  detailColumn: {
    flex: 1,
    gap: 28,
  },
  sectionTitleBlock: {
    marginBottom: 26,
    gap: 9,
  },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
  },
  sectionLine: {
    width: 64,
    height: 2,
    backgroundColor: colors.primary,
  },
  muscleList: {
    gap: 19,
  },
  muscleItem: {
    gap: 8,
  },
  muscleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  muscleName: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  muscleSessions: {
    color: colors.onSurface,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  progressTrack: {
    height: 4,
    overflow: 'hidden',
    backgroundColor: colors.surfaceHighest,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  lastSession: {
    minHeight: 220,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#343434',
  },
  lastSessionImage: {
    opacity: 0.5,
  },
  lastSessionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14, 14, 14, 0.48)',
  },
  lastSessionContent: {
    padding: 24,
  },
  lastSessionEyebrow: {
    marginBottom: 10,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
  },
  lastSessionTitle: {
    color: colors.onSurface,
    fontSize: 28,
    lineHeight: 31,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  lastSessionDetails: {
    marginTop: 9,
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  bottomNavigation: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#292929',
  },
  navItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navLabel: {
    color: '#555555',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  navLabelActive: {
    color: colors.primary,
  },
  activeNavIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 32,
    height: 2,
    backgroundColor: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.76)',
  },
  modalSheet: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '88%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.background,
    borderTopWidth: 3,
    borderTopColor: colors.primary,
  },
  modalHeader: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalEyebrow: {
    marginBottom: 4,
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  modalTitle: {
    color: colors.onSurface,
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    gap: 24,
    paddingBottom: 4,
  },
  modalField: {
    gap: 10,
  },
  modalLabel: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  modalInput: {
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: colors.surfaceHighest,
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0,
  },
  segmentedControl: {
    height: 48,
    flexDirection: 'row',
    backgroundColor: colors.surfaceHighest,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonSelected: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  segmentTextSelected: {
    color: '#002910',
  },
  muscleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleOption: {
    minHeight: 38,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHighest,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  muscleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(134, 254, 167, 0.08)',
  },
  muscleOptionText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  muscleOptionTextSelected: {
    color: colors.primary,
  },
  stepperRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  stepper: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighest,
  },
  stepperButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    width: 42,
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
});
