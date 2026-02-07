export interface Profile {
    id: string; // uuid
    email: string;
    full_name: string;
    avatar_url?: string;
    created_at: string;
}

export interface Child {
    id: string; // uuid
    user_id: string;
    name: string;
    gender: 'boy' | 'girl';
    character_icon?: string;
    avatar_url?: string; // Added validation
    birthdate?: string;
    created_at: string;
}

export interface Schedule {
    id: string; // uuid
    user_id: string;
    child_id: string | null;
    title: string;
    start_time: string; // ISO string
    end_time?: string;
    location?: string;
    color?: string;
    category?: string;
    is_completed?: boolean;
    is_alarm?: boolean;
    alarm_sound?: string;
    memo?: string; // 메모
    created_at: string;
}
