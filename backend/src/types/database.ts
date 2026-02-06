// Helper types
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

// Row definitions
export interface CulturalProfileRow {
    id: string;
    language_code: string;
    language_name: string;
    communication_style: string;
    formality_level: number;
    relationship_building: string;
    decision_making: string;
    negotiation_approach: string;
    taboos: string[];
    power_phrases: string[];
    greetings_protocol: string;
    business_etiquette: string[];
    created_at: string;
    updated_at: string;
}

export interface CallRow {
    id: string;
    user_id: string;
    language_code: string;
    scenario: string;
    transcript: string;
    analysis: Json;
    scores: Json;
    cultural_scores: Json;
    duration_seconds: number;
    created_at: string;
}

export interface UserProfileRow {
    id: string;
    user_id: string;
    full_name: string;
    company: string | null;
    role: string | null;
    target_languages: string[];
    practice_count: number;
    average_score: number;
    cultural_iq: number;
    created_at: string;
    updated_at: string;
}

export interface AnalyticsEventRow {
    id: string;
    user_id: string;
    event_type: string;
    event_data: Json;
    created_at: string;
}

// Database interface
export interface Database {
    public: {
        Tables: {
            cultural_profiles: {
                Row: CulturalProfileRow;
                Insert: Omit<CulturalProfileRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<CulturalProfileRow, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            calls: {
                Row: CallRow;
                Insert: Omit<CallRow, 'id' | 'created_at'>;
                Update: Partial<Omit<CallRow, 'id' | 'created_at'>>;
                Relationships: [];
            };
            user_profiles: {
                Row: UserProfileRow;
                Insert: Omit<UserProfileRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<UserProfileRow, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            analytics_events: {
                Row: AnalyticsEventRow;
                Insert: Omit<AnalyticsEventRow, 'id' | 'created_at'>;
                Update: Partial<Omit<AnalyticsEventRow, 'id' | 'created_at'>>;
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}


