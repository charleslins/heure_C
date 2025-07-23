export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      cantons: {
        Row: {
          code: string
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      global_holidays: {
        Row: {
          date: string
          id: string
          is_official: boolean | null
          name: string
        }
        Insert: {
          date: string
          id?: string
          is_official?: boolean | null
          name: string
        }
        Update: {
          date?: string
          id?: string
          is_official?: boolean | null
          name?: string
        }
        Relationships: []
      }
      global_settings: {
        Row: {
          id: number
          settings_data: Json | null
        }
        Insert: {
          id?: number
          settings_data?: Json | null
        }
        Update: {
          id?: number
          settings_data?: Json | null
        }
        Relationships: []
      }
      municipalities: {
        Row: {
          canton_id: number | null
          created_at: string | null
          id: number
          name: string
          postal_code: string | null
        }
        Insert: {
          canton_id?: number | null
          created_at?: string | null
          id?: number
          name: string
          postal_code?: string | null
        }
        Update: {
          canton_id?: number | null
          created_at?: string | null
          id?: number
          name?: string
          postal_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "municipalities_canton_id_fkey"
            columns: ["canton_id"]
            isOneToOne: false
            referencedRelation: "cantons"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          canton_id: number | null
          created_at: string
          email: string | null
          employee_id: string | null
          hire_date: string | null
          id: string
          municipality_id: number | null
          name: string | null
          photo_url: string | null
          position: string | null
          role: string | null
          updated_at: string
          work_schedule: Json | null
        }
        Insert: {
          canton_id?: number | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          hire_date?: string | null
          id: string
          municipality_id?: number | null
          name?: string | null
          photo_url?: string | null
          position?: string | null
          role?: string | null
          updated_at?: string
          work_schedule?: Json | null
        }
        Update: {
          canton_id?: number | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          hire_date?: string | null
          id?: string
          municipality_id?: number | null
          name?: string | null
          photo_url?: string | null
          position?: string | null
          role?: string | null
          updated_at?: string
          work_schedule?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_canton_id_fkey"
            columns: ["canton_id"]
            isOneToOne: false
            referencedRelation: "cantons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      regional_holidays: {
        Row: {
          canton_id: number | null
          created_at: string | null
          date: string
          holiday_type: string | null
          id: number
          is_recurring: boolean | null
          municipality_id: number | null
          name: string
        }
        Insert: {
          canton_id?: number | null
          created_at?: string | null
          date: string
          holiday_type?: string | null
          id?: number
          is_recurring?: boolean | null
          municipality_id?: number | null
          name: string
        }
        Update: {
          canton_id?: number | null
          created_at?: string | null
          date?: string
          holiday_type?: string | null
          id?: number
          is_recurring?: boolean | null
          municipality_id?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "regional_holidays_canton_id_fkey"
            columns: ["canton_id"]
            isOneToOne: false
            referencedRelation: "cantons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regional_holidays_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          permissions: string[]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          permissions?: string[]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          permissions?: string[]
          updated_at?: string | null
        }
        Relationships: []
      }
      user_daily_logs: {
        Row: {
          afternoon: Json | null
          has_inputs: boolean | null
          is_working_day: boolean | null
          log_date: string
          morning: Json | null
          user_id: string
        }
        Insert: {
          afternoon?: Json | null
          has_inputs?: boolean | null
          is_working_day?: boolean | null
          log_date: string
          morning?: Json | null
          user_id: string
        }
        Update: {
          afternoon?: Json | null
          has_inputs?: boolean | null
          is_working_day?: boolean | null
          log_date?: string
          morning?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_vacations: {
        Row: {
          admin_comment: string | null
          status: string
          user_id: string
          vacation_date: string
        }
        Insert: {
          admin_comment?: string | null
          status: string
          user_id: string
          vacation_date: string
        }
        Update: {
          admin_comment?: string | null
          status?: string
          user_id?: string
          vacation_date?: string
        }
        Relationships: []
      }
      user_weekly_contracts: {
        Row: {
          contract_data: Json | null
          month: number
          user_id: string
          year: number
        }
        Insert: {
          contract_data?: Json | null
          month: number
          user_id: string
          year: number
        }
        Update: {
          contract_data?: Json | null
          month?: number
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean
          language: string
          last_name: string
          role_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          is_active?: boolean
          language?: string
          last_name: string
          role_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean
          language?: string
          last_name?: string
          role_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      vacation_requests: {
        Row: {
          admin_comment: string | null
          comment: string | null
          created_at: string | null
          date: string
          id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_comment?: string | null
          comment?: string | null
          created_at?: string | null
          date: string
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_comment?: string | null
          comment?: string | null
          created_at?: string | null
          date?: string
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      pending_vacation_requests: {
        Row: {
          comment: string | null
          created_at: string | null
          date: string | null
          id: string | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_permissions: {
        Args: { user_id: string }
        Returns: string[]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
