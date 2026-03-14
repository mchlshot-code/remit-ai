import { UserSession } from './types';
import { supabase } from '../../lib/supabase';

export async function getSession(): Promise<UserSession | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? { user: session.user } : null;
}
