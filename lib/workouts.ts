import { supabase } from '@/lib/supabase';

export type SaveWorkoutInput = {
  userId: string;
  workoutDate: string;
  attendance: boolean;
  weightKg: number;
  waistInches: number;
  durationMinutes: number;
  musclesTrained: string[];
  cardioMinutes: number;
  yogaMinutes: number;
};

export type WorkoutRow = {
  id: string;
  user_id: string;
  workout_date: string;
  attendance: boolean;
  weight_kg: number | null;
  waist_inches: number | null;
  duration_minutes: number | null;
  muscles_trained: string[] | null;
  cardio_minutes: number | null;
  yoga_minutes: number | null;
  created_at: string;
  updated_at: string;
};

type ExistingWorkoutRow = {
  id: string;
};

function toWorkoutPayload(input: SaveWorkoutInput) {
  return {
    user_id: input.userId,
    workout_date: input.workoutDate,
    attendance: input.attendance,
    weight_kg: input.weightKg,
    waist_inches: input.waistInches,
    duration_minutes: input.durationMinutes,
    muscles_trained: input.musclesTrained,
    cardio_minutes: input.cardioMinutes,
    yoga_minutes: input.yogaMinutes,
  };
}

export async function saveWorkoutForDate(input: SaveWorkoutInput) {
  const payload = toWorkoutPayload(input);

  const { data: existingWorkout, error: lookupError } = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', input.userId)
    .eq('workout_date', input.workoutDate)
    .maybeSingle<ExistingWorkoutRow>();

  if (lookupError) {
    throw lookupError;
  }

  if (existingWorkout) {
    const { error } = await supabase
      .from('workouts')
      .update(payload)
      .eq('id', existingWorkout.id)
      .eq('user_id', input.userId);

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await supabase.from('workouts').insert(payload);

  if (error) {
    throw error;
  }
}

export async function fetchUserWorkouts(userId: string) {
  const { data, error } = await supabase
    .from('workouts')
    .select(
      'id, user_id, workout_date, attendance, weight_kg, waist_inches, duration_minutes, muscles_trained, cardio_minutes, yoga_minutes, created_at, updated_at'
    )
    .eq('user_id', userId)
    .order('workout_date', { ascending: true })
    .returns<WorkoutRow[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}
