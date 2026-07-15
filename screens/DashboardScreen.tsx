import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  dashboardTabs,
  type DashboardStat,
  lastSession,
  type MuscleProgress,
  workoutMuscleOptions,
} from '@/constants/dashboard-data';
import { deleteCurrentAccount } from '@/lib/account';
import { supabase } from '@/lib/supabase';
import {
  fetchUserWorkouts,
  saveWorkoutForDate,
  type WorkoutRow,
} from '@/lib/workouts';
import { useAuthSession } from '@/providers/AuthSessionProvider';

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
    destructive: false,
  },
  {
    key: 'deleteAccount',
    label: 'DELETE ACCOUNT',
    icon: 'trash-outline',
    destructive: true,
  },
] as const;

type CalendarDay = {
  dateKey: string;
  dayOfMonth: number;
  workout: WorkoutRow | null;
  intensity: 0 | 1 | 2 | 3 | 4;
  isToday: boolean;
  isFuture: boolean;
};

type CalendarCell = CalendarDay | null;

type DashboardAnalytics = {
  stats: DashboardStat[];
  muscleProgress: MuscleProgress[];
  totalWorkoutsThisYear: number;
};

export default function DashboardScreen() {
  const router = useRouter();
  const { session } = useAuthSession();
  const { width } = useWindowDimensions();
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [isWorkoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [isProfileMenuVisible, setProfileMenuVisible] = useState(false);
  const [isSigningOut, setSigningOut] = useState(false);
  const [isDeletingAccount, setDeletingAccount] = useState(false);
  const isWideLayout = width >= 800;
  const contentWidth = Math.min(width, 1024) - 48;
  const statCardWidth = isWideLayout
    ? (contentWidth - 36) / 4
    : (contentWidth - 12) / 2;

  const loadWorkouts = useCallback(async () => {
    if (!session?.user.id) {
      setWorkouts([]);
      return;
    }

    try {
      const userWorkouts = await fetchUserWorkouts(session.user.id);
      setWorkouts(userWorkouts);
    } catch {
      Alert.alert(
        'Unable to Load Dashboard',
        'Please check your connection and try again.'
      );
    }
  }, [session?.user.id]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const dashboardAnalytics = useMemo(
    () => calculateDashboardAnalytics(workouts),
    [workouts]
  );

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

  const handleDeleteAccount = () => {
    if (isDeletingAccount || isSigningOut) {
      return;
    }

    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your KINETIC account?\n\nThis action cannot be undone.\n\nDeleting your account will permanently remove:\n\n• Your account\n• Workout history\n• Attendance records\n• Streaks\n• Muscle history\n• Cardio records\n• Yoga records\n• Any other data associated with your account',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: confirmFinalAccountDeletion,
        },
      ]
    );
  };

  const confirmFinalAccountDeletion = () => {
    Alert.alert(
      'Final Confirmation',
      'This action is permanent and cannot be undone.\n\nAre you absolutely sure you want to delete your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Delete Forever',
          style: 'destructive',
          onPress: deleteAccount,
        },
      ]
    );
  };

  const deleteAccount = async () => {
    if (isDeletingAccount || isSigningOut) {
      return;
    }

    setDeletingAccount(true);

    try {
      await deleteCurrentAccount();
      await supabase.auth.signOut({ scope: 'local' });
      setProfileMenuVisible(false);

      Alert.alert(
        'Account Deleted',
        'Your account has been permanently deleted.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ],
        { cancelable: false }
      );
    } catch {
      Alert.alert(
        "We couldn't delete your account.",
        'Please try again.'
      );
    } finally {
      setDeletingAccount(false);
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
            {dashboardAnalytics.stats.map((stat) => (
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

          <AnnualEngineLoad
            totalWorkoutsThisYear={dashboardAnalytics.totalWorkoutsThisYear}
            workouts={workouts}
          />

          <View style={[styles.detailColumns, isWideLayout && styles.detailColumnsWide]}>
            <View style={styles.detailColumn}>
              <MusclesTrained muscleProgress={dashboardAnalytics.muscleProgress} />
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
        onSaved={loadWorkouts}
      />

      <ProfileMenu
        visible={isProfileMenuVisible}
        isSigningOut={isSigningOut}
        isDeletingAccount={isDeletingAccount}
        onClose={() => setProfileMenuVisible(false)}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
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
  isDeletingAccount: boolean;
  onClose: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
};

function ProfileMenu({
  visible,
  isSigningOut,
  isDeletingAccount,
  onClose,
  onLogout,
  onDeleteAccount,
}: ProfileMenuProps) {
  const isBusy = isSigningOut || isDeletingAccount;
  const actions = {
    logout: onLogout,
    deleteAccount: onDeleteAccount,
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
          onPress={isBusy ? undefined : onClose}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel="Close profile menu"
        />

        <View style={styles.profileMenu}>
          {profileMenuItems.map((item) => (
            <Pressable
              key={item.key}
              onPress={actions[item.key]}
              disabled={isBusy}
              style={({ pressed }) => [
                styles.profileMenuItem,
                pressed && styles.profileMenuItemPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ disabled: isBusy, busy: isBusy }}>
              {isDeletingAccount && item.key === 'deleteAccount' ? (
                <ActivityIndicator size="small" color="#ff716c" />
              ) : isSigningOut && item.key === 'logout' ? (
                <ActivityIndicator size="small" color="#ff716c" />
              ) : (
                <Ionicons
                  name={item.icon}
                  size={20}
                  color="#ff716c"
                />
              )}
              <Text
                style={[
                  styles.profileMenuItemText,
                  item.destructive && styles.profileMenuItemTextDestructive,
                ]}>
                {isDeletingAccount && item.key === 'deleteAccount'
                  ? 'DELETING...'
                  : isSigningOut && item.key === 'logout'
                    ? 'SIGNING OUT...'
                    : item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

type AnnualEngineLoadProps = {
  totalWorkoutsThisYear: number;
  workouts: WorkoutRow[];
};

function AnnualEngineLoad({ totalWorkoutsThisYear, workouts }: AnnualEngineLoadProps) {
  const { width } = useWindowDimensions();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const weeks = useMemo(
    () => buildMonthCalendar(visibleMonth, workouts),
    [visibleMonth, workouts]
  );
  const calendarWidth = Math.min(width - 88, 936);
  const cellGap = width < 420 ? 5 : 7;
  const cellSize = Math.max(
    34,
    Math.min(width < 420 ? 43 : 56, (calendarWidth - cellGap * 6) / 7)
  );
  const calendarGridWidth = cellSize * 7 + cellGap * 6;
  const canNavigateNext = !isSameMonth(visibleMonth, new Date());
  const hasWorkoutInVisibleMonth = weeks.some((week) =>
    week.some((day) => Boolean(day?.workout))
  );

  const goToPreviousMonth = () => {
    setVisibleMonth((current) => addMonths(current, -1));
  };

  const goToNextMonth = () => {
    if (canNavigateNext) {
      setVisibleMonth((current) => addMonths(current, 1));
    }
  };

  return (
    <View style={styles.heatmapSection}>
      <View style={styles.heatmapHeader}>
        <View style={styles.heatmapHeading}>
          <Text style={styles.sectionEyebrow}>MONTHLY ENGINE LOAD</Text>
          <Text style={styles.heatmapSubheading}>
            {totalWorkoutsThisYear} WORKOUTS RECORDED THIS YEAR
          </Text>
        </View>

        <View style={styles.monthControls}>
          <Pressable
            onPress={goToPreviousMonth}
            style={styles.monthButton}
            accessibilityRole="button"
            accessibilityLabel="Previous month">
            <Ionicons name="chevron-back" size={18} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.monthLabel}>{formatMonthLabel(visibleMonth)}</Text>
          <Pressable
            onPress={goToNextMonth}
            disabled={!canNavigateNext}
            style={[
              styles.monthButton,
              !canNavigateNext && styles.monthButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Next month"
            accessibilityState={{ disabled: !canNavigateNext }}>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={canNavigateNext ? colors.onSurface : colors.outline}
            />
          </Pressable>
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendLabel}>LOAD</Text>
          {heatColors.map((color) => (
            <View key={color} style={[styles.legendCell, { backgroundColor: color }]} />
          ))}
        </View>
      </View>

      <View style={styles.calendarPanel}>
        <View
          style={[
            styles.weekdayHeader,
            { width: calendarGridWidth, gap: cellGap },
          ]}>
          {dayLabels.map((day) => (
            <Text key={day} style={[styles.weekdayLabel, { width: cellSize }]}>
              {day}
            </Text>
          ))}
        </View>

        <View style={[styles.monthGrid, { width: calendarGridWidth, gap: cellGap }]}>
          {weeks.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={[styles.calendarWeek, { gap: cellGap }]}>
              {week.map((day, dayIndex) =>
                day ? (
                  <Pressable
                    key={day.dateKey}
                    onPress={() => setSelectedDay(day)}
                    disabled={day.isFuture}
                    style={[
                      styles.heatmapCell,
                      day.isToday && styles.todayHeatmapCell,
                      day.isFuture && styles.futureHeatmapCell,
                      {
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: heatColors[day.intensity],
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: day.isFuture }}
                    accessibilityLabel={`${day.dateKey}, load level ${day.intensity}`}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        day.intensity > 0 && styles.activeCalendarDayText,
                      ]}>
                      {day.dayOfMonth}
                    </Text>
                  </Pressable>
                ) : (
                  <View
                    key={`empty-${weekIndex}-${dayIndex}`}
                    style={{ width: cellSize, height: cellSize }}
                  />
                )
              )}
            </View>
          ))}
        </View>

        {!hasWorkoutInVisibleMonth ? (
          <Text style={styles.calendarEmptyHint}>
            Record your first workout to begin building your consistency.
          </Text>
        ) : null}
      </View>

      <WorkoutDayModal
        day={selectedDay}
        onClose={() => setSelectedDay(null)}
      />
    </View>
  );
}

type WorkoutDayModalProps = {
  day: CalendarDay | null;
  onClose: () => void;
};

function WorkoutDayModal({ day, onClose }: WorkoutDayModalProps) {
  const workout = day?.workout ?? null;

  return (
    <Modal
      visible={Boolean(day)}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.dayModalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close workout details"
        />

        <View style={styles.dayModalSheet}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalEyebrow}>WORKOUT DETAILS</Text>
              <Text style={styles.modalTitle}>{day ? formatDisplayDate(day.dateKey) : ''}</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={styles.modalCloseButton}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <Ionicons name="close" size={25} color={colors.onSurface} />
            </Pressable>
          </View>

          {workout ? (
            <View style={styles.dayDetails}>
              <WorkoutDetailRow label="ATTENDANCE" value={workout.attendance ? 'Present' : 'Absent'} />
              <WorkoutDetailRow label="WEIGHT" value={formatNullableMetric(workout.weight_kg, 'KG')} />
              <WorkoutDetailRow label="WAIST" value={formatNullableMetric(workout.waist_inches, 'IN')} />
              <WorkoutDetailRow
                label="DURATION"
                value={formatNullableMetric(workout.duration_minutes, 'MIN')}
              />
              <WorkoutDetailRow
                label="MUSCLES"
                value={formatMuscles(workout.muscles_trained)}
              />
              <WorkoutDetailRow
                label="CARDIO"
                value={formatNullableMetric(workout.cardio_minutes, 'MIN')}
              />
              <WorkoutDetailRow
                label="YOGA"
                value={formatNullableMetric(workout.yoga_minutes, 'MIN')}
              />
            </View>
          ) : (
            <Text style={styles.emptyWorkoutText}>No workout recorded.</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

type WorkoutDetailRowProps = {
  label: string;
  value: string;
};

function WorkoutDetailRow({ label, value }: WorkoutDetailRowProps) {
  return (
    <View style={styles.dayDetailRow}>
      <Text style={styles.dayDetailLabel}>{label}</Text>
      <Text style={styles.dayDetailValue}>{value}</Text>
    </View>
  );
}

type MusclesTrainedProps = {
  muscleProgress: MuscleProgress[];
};

function MusclesTrained({ muscleProgress }: MusclesTrainedProps) {
  return (
    <View>
      <View style={styles.sectionTitleBlock}>
        <Text style={styles.sectionTitle}>MUSCLES TRAINED</Text>
        <View style={styles.sectionLine} />
      </View>

      <View style={styles.muscleList}>
        {muscleProgress.map((muscle) => (
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
  onSaved: () => Promise<void>;
};

function RecordWorkoutModal({ visible, onClose, onSaved }: RecordWorkoutModalProps) {
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

      await onSaved();
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

function calculateDashboardAnalytics(workouts: WorkoutRow[]): DashboardAnalytics {
  const sortedWorkouts = [...workouts].sort((first, second) =>
    first.workout_date.localeCompare(second.workout_date)
  );
  const presentWorkouts = sortedWorkouts.filter((workout) => workout.attendance);
  const consistency = calculateConsistency(sortedWorkouts, presentWorkouts.length);
  const currentStreak = calculateCurrentStreak(presentWorkouts);
  const averageDuration = calculateAverageDuration(sortedWorkouts);
  const averageWeight = calculateAverageWeightLastSevenWorkoutDays(sortedWorkouts);
  const totalWorkoutsThisYear = calculateTotalWorkoutsThisYear(presentWorkouts);
  const muscleProgress = calculateMuscleProgress(sortedWorkouts);

  return {
    stats: [
      { label: 'CONSISTENCY', value: `${consistency}%`, highlighted: true },
      { label: 'CURRENT STREAK', value: `${currentStreak} DAYS` },
      { label: 'AVG TIME', value: `${averageDuration} MIN` },
      { label: 'AVG WEIGHT LAST WEEK', value: `${averageWeight} KG` },
      { label: 'TOTAL WORKOUTS', value: String(totalWorkoutsThisYear) },
    ],
    muscleProgress,
    totalWorkoutsThisYear,
  };
}

function buildMonthCalendar(month: Date, workouts: WorkoutRow[]) {
  const workoutsByDate = new Map(
    workouts.map((workout) => [workout.workout_date, workout])
  );
  const monthStart = startOfMonth(month);
  const daysInMonth = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0
  ).getDate();
  const mondayOffset = (monthStart.getDay() + 6) % 7;
  const cells: CalendarCell[] = Array.from<CalendarCell>({
    length: mondayOffset,
  }).fill(null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
    const dateKey = formatDateKey(date);
    const workout = workoutsByDate.get(dateKey) ?? null;
    const todayKey = getLocalDateKey();

    cells.push({
      dateKey,
      dayOfMonth: day,
      workout,
      intensity: workout ? calculateWorkoutIntensity(workout) : 0,
      isToday: dateKey === todayKey,
      isFuture: dateKey > todayKey,
    });
  }

  return Array.from({ length: Math.ceil(cells.length / 7) }, (_, weekIndex) =>
    cells.slice(weekIndex * 7, weekIndex * 7 + 7)
  );
}

function calculateWorkoutIntensity(workout: WorkoutRow): 0 | 1 | 2 | 3 | 4 {
  if (!workout.attendance) {
    return 0;
  }

  const score =
    1 +
    (workout.muscles_trained?.length ?? 0) +
    Math.floor((workout.cardio_minutes ?? 0) / 10) +
    Math.floor((workout.yoga_minutes ?? 0) / 10) +
    Math.floor((workout.duration_minutes ?? 0) / 30);

  if (score >= 7) {
    return 4;
  }

  if (score >= 5) {
    return 3;
  }

  if (score >= 3) {
    return 2;
  }

  return 1;
}

function calculateConsistency(workouts: WorkoutRow[], daysPresent: number) {
  if (workouts.length === 0) {
    return 0;
  }

  const firstWorkoutDate = parseDateKey(workouts[0].workout_date);
  const today = parseDateKey(getLocalDateKey());
  const daysSinceFirstWorkout =
    Math.max(0, differenceInDays(today, firstWorkoutDate)) + 1;

  return Math.round((daysPresent / daysSinceFirstWorkout) * 100);
}

function calculateCurrentStreak(presentWorkouts: WorkoutRow[]) {
  if (presentWorkouts.length === 0) {
    return 0;
  }

  const presentDates = new Set(
    presentWorkouts.map((workout) => workout.workout_date)
  );
  const today = parseDateKey(getLocalDateKey());
  const yesterday = addDays(today, -1);
  let cursor = presentDates.has(formatDateKey(today)) ? today : yesterday;

  if (!presentDates.has(formatDateKey(cursor))) {
    return 0;
  }

  let streak = 0;

  while (presentDates.has(formatDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function calculateAverageDuration(workouts: WorkoutRow[]) {
  const durations = workouts
    .map((workout) => workout.duration_minutes)
    .filter(isPresentNumber);

  return calculateRoundedAverage(durations);
}

function calculateAverageWeightLastSevenWorkoutDays(workouts: WorkoutRow[]) {
  const latestSevenWorkoutDays = [...workouts]
    .sort((first, second) => second.workout_date.localeCompare(first.workout_date))
    .slice(0, 7);
  const weights = latestSevenWorkoutDays
    .map((workout) => workout.weight_kg)
    .filter(isPresentNumber);

  return calculateRoundedAverage(weights);
}

function calculateTotalWorkoutsThisYear(presentWorkouts: WorkoutRow[]) {
  const currentYear = new Date().getFullYear();

  return presentWorkouts.filter(
    (workout) => parseDateKey(workout.workout_date).getFullYear() === currentYear
  ).length;
}

function calculateMuscleProgress(workouts: WorkoutRow[]) {
  const sessionCounts = new Map<string, number>();

  workoutMuscleOptions.forEach((muscle) => {
    sessionCounts.set(muscle.toUpperCase(), 0);
  });

  workouts.forEach((workout) => {
    workout.muscles_trained?.forEach((muscle) => {
      const normalizedMuscle = muscle.toUpperCase();
      sessionCounts.set(normalizedMuscle, (sessionCounts.get(normalizedMuscle) ?? 0) + 1);
    });
  });

  const highestSessionCount = Math.max(0, ...sessionCounts.values());

  return Array.from(sessionCounts.entries()).map(([name, sessions]) => ({
    name,
    sessions,
    progress: highestSessionCount === 0 ? 0 : sessions / highestSessionCount,
  }));
}

function calculateRoundedAverage(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return Math.round(total / values.length);
}

function isPresentNumber(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function isSameMonth(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth()
  );
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + days);

  return nextDate;
}

function differenceInDays(laterDate: Date, earlierDate: Date) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.floor(
    (laterDate.getTime() - earlierDate.getTime()) / millisecondsPerDay
  );
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatMonthLabel(date: Date) {
  return date
    .toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase();
}

function formatDisplayDate(dateKey: string) {
  return parseDateKey(dateKey).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatNullableMetric(value: number | null, unit: string) {
  if (!isPresentNumber(value)) {
    return '-';
  }

  return `${value} ${unit}`;
}

function formatMuscles(muscles: string[] | null) {
  if (!muscles || muscles.length === 0) {
    return '-';
  }

  return muscles.join(', ');
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
  profileMenuItemTextDestructive: {
    color: '#ff716c',
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
    padding: 16,
    backgroundColor: '#131313',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#292929',
  },
  heatmapHeader: {
    marginBottom: 16,
    alignItems: 'center',
    gap: 10,
  },
  heatmapHeading: {
    alignSelf: 'stretch',
    gap: 5,
  },
  monthControls: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  monthButton: {
    width: 32,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonDisabled: {
    opacity: 0.45,
  },
  monthLabel: {
    minWidth: 128,
    color: colors.onSurface,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    textAlign: 'center',
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
  calendarPanel: {
    gap: 8,
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  weekdayLabel: {
    color: colors.onSurface,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  monthGrid: {
    alignSelf: 'center',
  },
  calendarWeek: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  heatmapCell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  todayHeatmapCell: {
    borderWidth: 1,
    borderColor: colors.onSurface,
  },
  futureHeatmapCell: {
    opacity: 0.38,
  },
  calendarDayText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  activeCalendarDayText: {
    color: '#02240f',
  },
  calendarEmptyHint: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  dayModalOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  dayModalSheet: {
    width: '100%',
    maxWidth: 460,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.background,
    borderTopWidth: 3,
    borderTopColor: colors.primary,
  },
  dayDetails: {
    gap: 14,
  },
  dayDetailRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2d2d2d',
  },
  dayDetailLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  dayDetailValue: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'right',
  },
  emptyWorkoutText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 0.8,
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
