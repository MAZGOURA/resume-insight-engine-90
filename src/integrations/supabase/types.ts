export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          id: number
          password: string
          profile_name: string
        }
        Insert: {
          created_at?: string
          id?: number
          password: string
          profile_name: string
        }
        Update: {
          created_at?: string
          id?: number
          password?: string
          profile_name?: string
        }
        Relationships: []
      }
      attestation_counter: {
        Row: {
          counter: number
          created_at: string
          id: number
          last_reset_by: string | null
          last_reset_date: string | null
          updated_at: string
        }
        Insert: {
          counter?: number
          created_at?: string
          id?: number
          last_reset_by?: string | null
          last_reset_date?: string | null
          updated_at?: string
        }
        Update: {
          counter?: number
          created_at?: string
          id?: number
          last_reset_by?: string | null
          last_reset_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      attestation_requests: {
        Row: {
          attestation_number: number | null
          cin: string
          created_at: string
          first_name: string
          id: string
          last_name: string
          phone: string
          rejection_reason: string | null
          status: string | null
          student_group: Database["public"]["Enums"]["student_group"]
          student_id: string | null
          updated_at: string
          year_requested: number
        }
        Insert: {
          attestation_number?: number | null
          cin: string
          created_at?: string
          first_name: string
          id?: string
          last_name: string
          phone: string
          rejection_reason?: string | null
          status?: string | null
          student_group: Database["public"]["Enums"]["student_group"]
          student_id?: string | null
          updated_at?: string
          year_requested?: number
        }
        Update: {
          attestation_number?: number | null
          cin?: string
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          rejection_reason?: string | null
          status?: string | null
          student_group?: Database["public"]["Enums"]["student_group"]
          student_id?: string | null
          updated_at?: string
          year_requested?: number
        }
        Relationships: [
          {
            foreignKeyName: "attestation_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_attestation_requests_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      login_audit: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          device_info: string | null
          id: string
          ip_address: string | null
          login_timestamp: string
          success: boolean
          user_agent: string | null
          user_email: string
          user_type: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: string | null
          login_timestamp?: string
          success?: boolean
          user_agent?: string | null
          user_email: string
          user_type: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: string | null
          login_timestamp?: string
          success?: boolean
          user_agent?: string | null
          user_email?: string
          user_type?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          birth_date: string
          cin: string
          created_at: string
          email: string
          first_name: string
          formation_level: string
          formation_mode: string
          formation_type: string
          formation_year: string
          id: string
          inscription_number: string
          last_name: string
          password_changed: boolean | null
          password_changes_count: number | null
          password_changes_year: number | null
          password_hash: string | null
          speciality: string
          student_group: string
          updated_at: string
        }
        Insert: {
          birth_date: string
          cin: string
          created_at?: string
          email: string
          first_name: string
          formation_level: string
          formation_mode?: string
          formation_type?: string
          formation_year: string
          id?: string
          inscription_number: string
          last_name: string
          password_changed?: boolean | null
          password_changes_count?: number | null
          password_changes_year?: number | null
          password_hash?: string | null
          speciality: string
          student_group: string
          updated_at?: string
        }
        Update: {
          birth_date?: string
          cin?: string
          created_at?: string
          email?: string
          first_name?: string
          formation_level?: string
          formation_mode?: string
          formation_type?: string
          formation_year?: string
          id?: string
          inscription_number?: string
          last_name?: string
          password_changed?: boolean | null
          password_changes_count?: number | null
          password_changes_year?: number | null
          password_hash?: string | null
          speciality?: string
          student_group?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_update_attestation_counter: {
        Args: { new_counter_value: number }
        Returns: boolean
      }
      admin_update_password_changes_counter: {
        Args: { new_count: number; new_year?: number; student_email: string }
        Returns: boolean
      }
      change_student_password: {
        Args: {
          new_password: string
          old_password: string
          student_email: string
        }
        Returns: Json
      }
      get_student_request_count: {
        Args: { student_email: string }
        Returns: number
      }
      increment_attestation_counter: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      reset_attestation_counter: {
        Args: { reset_by_admin?: string }
        Returns: number
      }
      reset_password_changes_counter: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      admin_profile: "KENZA" | "GHIZLANE" | "ABDELMONIM"
      student_group:
        | "ID101"
        | "ID102"
        | "ID103"
        | "ID104"
        | "IDOSR201"
        | "IDOSR202"
        | "IDOSR203"
        | "IDOSR204"
        | "DEVOWFS201"
        | "DEVOWFS202"
        | "DEVOWFS203"
        | "DEVOWFS204"
        | "DEV101"
        | "DEV102"
        | "DEV103"
        | "DEV104"
        | "DEV105"
        | "DEV106"
        | "DEV107"
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
    Enums: {
      admin_profile: ["KENZA", "GHIZLANE", "ABDELMONIM"],
      student_group: [
        "ID101",
        "ID102",
        "ID103",
        "ID104",
        "IDOSR201",
        "IDOSR202",
        "IDOSR203",
        "IDOSR204",
        "DEVOWFS201",
        "DEVOWFS202",
        "DEVOWFS203",
        "DEVOWFS204",
        "DEV101",
        "DEV102",
        "DEV103",
        "DEV104",
        "DEV105",
        "DEV106",
        "DEV107",
      ],
    },
  },
} as const
