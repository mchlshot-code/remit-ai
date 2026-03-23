import { UserSession } from './types';
import { createClient as createServerClient } from '../../lib/supabase/server';
import { createClient as createBrowserClient } from '../../lib/supabase/client';

/**
 * Retrieves the current user session.
 * Standardized across the modular monolith.
 */
export async function getSession(): Promise<UserSession | null> {
    // Check if we are on the server or client
    const isServer = typeof window === 'undefined';
    const supabase = isServer ? createServerClient() : createBrowserClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    return session ? { user: session.user } : null;
}
