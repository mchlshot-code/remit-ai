import { User } from '@supabase/supabase-js';

export interface UserSession {
    user: User | null;
}
