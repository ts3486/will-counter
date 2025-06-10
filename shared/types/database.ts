export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth0_id: string
          email: string
          created_at: string
          last_login: string | null
          preferences: Json
        }
        Insert: {
          id?: string
          auth0_id: string
          email: string
          created_at?: string
          last_login?: string | null
          preferences?: Json
        }
        Update: {
          id?: string
          auth0_id?: string
          email?: string
          created_at?: string
          last_login?: string | null
          preferences?: Json
        }
      }
      will_counts: {
        Row: {
          id: string
          user_id: string
          date: string
          count: number
          timestamps: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          count?: number
          timestamps?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          count?: number
          timestamps?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_today_count: {
        Args: {
          p_user_id: string
        }
        Returns: Database['public']['Tables']['will_counts']['Row']
      }
      increment_will_count: {
        Args: {
          p_user_id: string
        }
        Returns: Database['public']['Tables']['will_counts']['Row']
      }
      get_user_statistics: {
        Args: {
          p_user_id: string
          p_days?: number
        }
        Returns: {
          date: string
          count: number
          total_sessions: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type UserPreferences = {
  soundEnabled: boolean
  notificationEnabled: boolean
  theme: 'light' | 'dark'
}

export type WillCount = Database['public']['Tables']['will_counts']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type UserStatistics = {
  date: string
  count: number
  total_sessions: number
}