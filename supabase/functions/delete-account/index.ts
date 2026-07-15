import { createClient } from 'jsr:@supabase/supabase-js@2';

type ErrorResponse = {
  error: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function errorResponse(error: string, status: number) {
  return jsonResponse({ error } satisfies ErrorResponse, status);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed.', 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return errorResponse('Server is not configured.', 500);
  }

  const authorization = req.headers.get('Authorization');

  if (!authorization) {
    return errorResponse('Authentication required.', 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return errorResponse('Authentication required.', 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error: workoutsError } = await adminClient
    .from('workouts')
    .delete()
    .eq('user_id', user.id);

  if (workoutsError) {
    console.error('Failed to delete workouts', workoutsError);
    return errorResponse('Account deletion failed.', 500);
  }

  const { error: profileError } = await adminClient
    .from('profiles')
    .delete()
    .eq('id', user.id);

  if (profileError) {
    console.error('Failed to delete profile', profileError);
    return errorResponse('Account deletion failed.', 500);
  }

  const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
    user.id,
    false
  );

  if (deleteUserError) {
    console.error('Failed to delete auth user', deleteUserError);
    return errorResponse('Account deletion failed.', 500);
  }

  return jsonResponse({ success: true });
});
