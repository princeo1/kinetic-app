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

type WorkoutRow = {
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
    .maybeSingle<WorkoutRow>();

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
