export type DashboardStat = {
  label: string;
  value: string;
  highlighted?: boolean;
};

export type MuscleProgress = {
  name: string;
  sessions: number;
  progress: number;
};

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
  title: 'NO SESSION YET',
  details: 'Record a workout to start building your training log',
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDs8JY4lC8PL8tHPrzJRGGkcetxh6CKzESmHPr7_93X-9fE9vIIEKjZHFSVvnl2Y5NZZuWEfVwnLz5SGNiQVz9xHvOY1NVVCfdVa3NyOWRbGNWJ9uXmgH7QY7P8so1v8Ikia5yjAZpNt-SCV2p8rkr6A8SgCDtxxwK8PWjTpwASOAccyrPpyt4Dl6KB7M32joKJUDRsjIm5gguwyZXsKEi3B5knMbvfFy1hcc3ymz6WqkBFURLZ7DzL2-PnI4JHoJ2x2OKm4_O9Lxs',
};

export const dashboardTabs = [
  { label: 'DASHBOARD', icon: 'speedometer-outline' },
  { label: 'TRAINING', icon: 'barbell-outline' },
  { label: 'VITALS', icon: 'pulse-outline' },
  { label: 'GEAR', icon: 'options-outline' },
] as const;
