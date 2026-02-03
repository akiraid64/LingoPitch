export interface Database {
    public: {
        Tables: {
            cultural_profiles: {
                Row: {
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
                };
                Insert: Omit<Database['public']['Tables']['cultural_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['cultural_profiles']['Insert']>;
            };
            calls: {
                Row: {
                    id: string;
                    user_id: string;
                    language_code: string;
                    scenario: string;
                    transcript: string;
                    analysis: any;
                    scores: any;
                    cultural_scores: any;
                    duration_seconds: number;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['calls']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['calls']['Insert']>;
            };
            user_profiles: {
                Row: {
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
                };
                Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
            };
            analytics_events: {
                Row: {
                    id: string;
                    user_id: string;
                    event_type: string;
                    event_data: any;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['analytics_events']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['analytics_events']['Insert']>;
            };
        };
    };
}
