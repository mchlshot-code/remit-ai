import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key_to_pass_build';

export const supabase = createClient(supabaseUrl, supabaseKey);
