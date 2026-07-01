export type DashboardStat = {
  label: string;
  value: string;
  highlighted?: boolean;
};

export type HeatmapDay = {
  date: string;
  intensity: 0 | 1 | 2 | 3 | 4;
};

export type MuscleProgress = {
  name: string;
  sessions: number;
  progress: number;
};

export const dashboardStats: DashboardStat[] = [
  { label: 'CONSISTENCY', value: '94%', highlighted: true },
  { label: 'CURRENT STREAK', value: '12 DAYS' },
  { label: 'AVG TIME', value: '72 MIN' },
  { label: 'AVG WEIGHT LAST WEEK', value: '84.5 KG' },
];

const annualStartDate = new Date(Date.UTC(2026, 0, 1));

export const annualLoadData: HeatmapDay[] = Array.from({ length: 365 }, (_, index) => {
  const date = new Date(annualStartDate);
  date.setUTCDate(annualStartDate.getUTCDate() + index);

  const activityRank = (index * 37) % 365;
  const intensity = activityRank < 284 ? (((index * 13) % 4) + 1) as 1 | 2 | 3 | 4 : 0;

  return {
    date: date.toISOString().slice(0, 10),
    intensity,
  };
});

export const annualWorkoutCount = annualLoadData.filter((day) => day.intensity > 0).length;

export const muscleProgressData: MuscleProgress[] = [
  { name: 'CHEST', sessions: 4, progress: 0.8 },
  { name: 'BACK', sessions: 3, progress: 0.6 },
  { name: 'LEGS', sessions: 2, progress: 0.4 },
  { name: 'SHOULDERS', sessions: 3, progress: 0.6 },
  { name: 'ARMS', sessions: 5, progress: 1 },
  { name: 'CARDIO', sessions: 12, progress: 1 },
  { name: 'YOGA', sessions: 4, progress: 0.8 },
];

export const workoutMuscleOptions = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Full Body',
];

export const lastSession = {
  eyebrow: 'LAST SESSION',
  title: 'UPPER BODY CRUSH',
  details: 'Yesterday | 1h 14m | 18,420 kg total',
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDs8JY4lC8PL8tHPrzJRGGkcetxh6CKzESmHPr7_93X-9fE9vIIEKjZHFSVvnl2Y5NZZuWEfVwnLz5SGNiQVz9xHvOY1NVVCfdVa3NyOWRbGNWJ9uXmgH7QY7P8so1v8Ikia5yjAZpNt-SCV2p8rkr6A8SgCDtxxwK8PWjTpwASOAccyrPpyt4Dl6KB7M32joKJUDRsjIm5gguwyZXsKEi3B5knMbvfFy1hcc3ymz6WqkBFURLZ7DzL2-PnI4JHoJ2x2OKm4_O9Lxs',
};

export const dashboardTabs = [
  { label: 'DASHBOARD', icon: 'speedometer-outline' },
  { label: 'TRAINING', icon: 'barbell-outline' },
  { label: 'VITALS', icon: 'pulse-outline' },
  { label: 'GEAR', icon: 'options-outline' },
] as const;
