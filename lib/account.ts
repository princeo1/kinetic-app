import { supabase } from '@/lib/supabase';

export async function deleteCurrentAccount() {
  const { error } = await supabase.functions.invoke('delete-account', {
    method: 'POST',
  });

  if (error) {
    throw error;
  }
}
