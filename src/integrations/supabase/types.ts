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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      command_consent_events: {
        Row: {
          actor: string
          command_id: string
          created_at: string
          details: Json
          device_id: string
          id: string
          owner_id: string
          status: Database["public"]["Enums"]["consent_status"]
        }
        Insert: {
          actor?: string
          command_id: string
          created_at?: string
          details?: Json
          device_id: string
          id?: string
          owner_id: string
          status: Database["public"]["Enums"]["consent_status"]
        }
        Update: {
          actor?: string
          command_id?: string
          created_at?: string
          details?: Json
          device_id?: string
          id?: string
          owner_id?: string
          status?: Database["public"]["Enums"]["consent_status"]
        }
        Relationships: [
          {
            foreignKeyName: "command_consent_events_command_id_fkey"
            columns: ["command_id"]
            isOneToOne: false
            referencedRelation: "device_commands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "command_consent_events_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      device_commands: {
        Row: {
          command_type: Database["public"]["Enums"]["device_command_type"]
          completed_at: string | null
          consent_status: Database["public"]["Enums"]["consent_status"]
          created_at: string
          device_id: string
          error_message: string | null
          id: string
          owner_id: string
          parameters: Json
          started_at: string | null
          status: Database["public"]["Enums"]["device_command_status"]
        }
        Insert: {
          command_type: Database["public"]["Enums"]["device_command_type"]
          completed_at?: string | null
          consent_status?: Database["public"]["Enums"]["consent_status"]
          created_at?: string
          device_id: string
          error_message?: string | null
          id?: string
          owner_id: string
          parameters?: Json
          started_at?: string | null
          status?: Database["public"]["Enums"]["device_command_status"]
        }
        Update: {
          command_type?: Database["public"]["Enums"]["device_command_type"]
          completed_at?: string | null
          consent_status?: Database["public"]["Enums"]["consent_status"]
          created_at?: string
          device_id?: string
          error_message?: string | null
          id?: string
          owner_id?: string
          parameters?: Json
          started_at?: string | null
          status?: Database["public"]["Enums"]["device_command_status"]
        }
        Relationships: [
          {
            foreignKeyName: "device_commands_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      device_telemetry: {
        Row: {
          command_id: string | null
          created_at: string
          device_id: string
          id: string
          owner_id: string
          payload_data: Json
          storage_path: string | null
          telemetry_type: Database["public"]["Enums"]["telemetry_type"]
        }
        Insert: {
          command_id?: string | null
          created_at?: string
          device_id: string
          id?: string
          owner_id: string
          payload_data?: Json
          storage_path?: string | null
          telemetry_type: Database["public"]["Enums"]["telemetry_type"]
        }
        Update: {
          command_id?: string | null
          created_at?: string
          device_id?: string
          id?: string
          owner_id?: string
          payload_data?: Json
          storage_path?: string | null
          telemetry_type?: Database["public"]["Enums"]["telemetry_type"]
        }
        Relationships: [
          {
            foreignKeyName: "device_telemetry_command_id_fkey"
            columns: ["command_id"]
            isOneToOne: false
            referencedRelation: "device_commands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_telemetry_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          battery_level: number | null
          child_name: string
          connection_status: Database["public"]["Enums"]["device_connection_status"]
          created_at: string
          id: string
          last_seen_at: string | null
          name: string
          owner_id: string
          paired_at: string | null
          pairing_code: string
          platform: Database["public"]["Enums"]["device_platform"]
          updated_at: string
        }
        Insert: {
          battery_level?: number | null
          child_name: string
          connection_status?: Database["public"]["Enums"]["device_connection_status"]
          created_at?: string
          id?: string
          last_seen_at?: string | null
          name: string
          owner_id: string
          paired_at?: string | null
          pairing_code?: string
          platform?: Database["public"]["Enums"]["device_platform"]
          updated_at?: string
        }
        Update: {
          battery_level?: number | null
          child_name?: string
          connection_status?: Database["public"]["Enums"]["device_connection_status"]
          created_at?: string
          id?: string
          last_seen_at?: string | null
          name?: string
          owner_id?: string
          paired_at?: string | null
          pairing_code?: string
          platform?: Database["public"]["Enums"]["device_platform"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          display_name: string
          id: string
          phone: string | null
          preferences: Json
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          display_name?: string
          id: string
          phone?: string | null
          preferences?: Json
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          display_name?: string
          id?: string
          phone?: string | null
          preferences?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      consent_status:
        | "not_required"
        | "pending"
        | "granted"
        | "denied"
        | "expired"
      device_command_status:
        | "pending"
        | "processing"
        | "completed"
        | "denied"
        | "failed"
      device_command_type:
        | "get_location"
        | "capture_photo"
        | "capture_screenshot"
        | "record_screen"
        | "record_audio"
        | "send_message"
        | "play_alert"
      device_connection_status: "offline" | "online"
      device_platform: "android" | "ios" | "other"
      telemetry_type:
        | "location"
        | "photo"
        | "screenshot"
        | "screen_recording"
        | "audio_recording"
        | "device_status"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      consent_status: [
        "not_required",
        "pending",
        "granted",
        "denied",
        "expired",
      ],
      device_command_status: [
        "pending",
        "processing",
        "completed",
        "denied",
        "failed",
      ],
      device_command_type: [
        "get_location",
        "capture_photo",
        "capture_screenshot",
        "record_screen",
        "record_audio",
        "send_message",
        "play_alert",
      ],
      device_connection_status: ["offline", "online"],
      device_platform: ["android", "ios", "other"],
      telemetry_type: [
        "location",
        "photo",
        "screenshot",
        "screen_recording",
        "audio_recording",
        "device_status",
      ],
    },
  },
} as const
